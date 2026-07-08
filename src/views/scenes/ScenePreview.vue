<template>
  <div class="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans">
    <div class="absolute top-4 left-4 z-50 flex items-center gap-3 rounded-lg bg-slate-900/90 px-4 py-2 backdrop-blur border border-slate-800 shadow-xl select-none">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
      <div class="text-sm font-semibold tracking-wide text-slate-200">{{ sceneTitle }}</div>
      <el-tag size="small" type="info" effect="dark" class="border-slate-700 bg-slate-800">3D 数字孪生</el-tag>
      <el-button size="small" type="info" plain class="ml-2 hover:bg-slate-800 border-slate-700 text-slate-300" @click="backToEditor">
        返回编辑
      </el-button>
    </div>

    <div ref="canvasContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import request from '../../utils/request'
import type { SceneProject } from '../../types/platform'
import { loadImportedModel } from './scene-model-loader'

interface SceneNode {
  id: string
  name: string
  type: string
  sourceType?: 'procedural' | 'imported'
  sourceUrl?: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  props: {
    datasetId?: string
    alarmField?: string
    speedField?: string
  }
}

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const sceneTitle = ref('大屏画布')
const sceneNodes = ref<SceneNode[]>([])
const canvasContainer = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationFrameId: number
const modelGroupMap = new Map<string, THREE.Group>()

function createProceduralMesh(type: string, id: string): THREE.Group {
  const group = new THREE.Group()
  group.name = id

  if (type === 'cnc') {
    const baseGeo = new THREE.BoxGeometry(3, 1.8, 2.2)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.y = 0.9
    group.add(baseMesh)

    const glassGeo = new THREE.BoxGeometry(2.2, 1, 0.1)
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.9 })
    const glassMesh = new THREE.Mesh(glassGeo, glassMat)
    glassMesh.position.set(0, 1.1, 1.1)
    group.add(glassMesh)

    const beaconGeo = new THREE.SphereGeometry(0.15, 16, 16)
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.5 })
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat)
    beaconMesh.position.set(1.2, 1.9, 0.9)
    group.add(beaconMesh)
  } else if (type === 'arm') {
    const baseGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.y = 0.15
    group.add(baseMesh)

    const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 16)
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat)
    shaftMesh.position.set(0, 1.0, 0)
    group.add(shaftMesh)

    const jointGroup = new THREE.Group()
    jointGroup.position.set(0, 1.8, 0)
    const jointGeo = new THREE.BoxGeometry(0.3, 1.2, 0.3)
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, metalness: 0.7 })
    const jointMesh = new THREE.Mesh(jointGeo, jointMat)
    jointMesh.position.set(0.3, 0.6, 0)
    jointMesh.rotation.z = Math.PI / 4
    jointGroup.add(jointMesh)
    group.add(jointGroup)
  } else {
    const motorGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.8, 32)
    motorGeo.rotateZ(Math.PI / 2)
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.9, roughness: 0.3 })
    const motorMesh = new THREE.Mesh(motorGeo, motorMat)
    motorMesh.position.y = 0.6
    group.add(motorMesh)

    const fanGroup = new THREE.Group()
    fanGroup.name = 'rotor'
    fanGroup.position.set(-1.05, 0.6, 0)

    const fanGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.3, 32)
    fanGeo.rotateZ(Math.PI / 2)
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 })
    const fanMesh = new THREE.Mesh(fanGeo, fanMat)
    fanGroup.add(fanMesh)
    group.add(fanGroup)
  }

  return group
}

async function loadProject() {
  try {
    const res: any = await request.get(`/api/sceneProjects/${projectId}`)
    const item = res.item as SceneProject
    sceneTitle.value = item.name
    sceneNodes.value = typeof item.sceneNodes === 'string' ? JSON.parse(item.sceneNodes) : (item.sceneNodes || [])

    modelGroupMap.forEach((mesh) => scene.remove(mesh))
    modelGroupMap.clear()

    for (const node of sceneNodes.value) {
      const mesh = node.sourceType === 'imported' && node.sourceUrl
        ? await loadImportedModel(node.sourceUrl)
        : createProceduralMesh(node.type, node.id)
      mesh.name = node.id
      mesh.position.set(node.position.x, node.position.y, node.position.z)
      mesh.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z)
      mesh.scale.set(node.scale.x, node.scale.y, node.scale.z)
      scene.add(mesh)
      modelGroupMap.set(node.id, mesh)
    }
  } catch (err) {
    console.error(err)
  }
}

function backToEditor() {
  router.push(`/scenes/${projectId}/editor`)
}

function initThree() {
  if (!canvasContainer.value) return
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x020617, 0.015)

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.set(10, 10, 15)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(width, height)
  renderer.setClearColor(0x020617, 1)
  canvasContainer.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05

  scene.add(new THREE.GridHelper(50, 50, 0x0891b2, 0x1e293b))
  scene.add(new THREE.AmbientLight(0xffffff, 0.35))

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.75)
  dirLight.position.set(15, 25, 10)
  scene.add(dirLight)

  const pointLight = new THREE.PointLight(0x06b6d4, 1, 20)
  pointLight.position.set(0, 5, 0)
  scene.add(pointLight)

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
}

function handleResize() {
  if (!canvasContainer.value || !renderer || !camera) return
  const w = canvasContainer.value.clientWidth
  const h = canvasContainer.value.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

onMounted(async () => {
  initThree()
  await loadProject()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationFrameId)
  renderer?.dispose()
})
</script>
