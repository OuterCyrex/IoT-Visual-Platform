<template>
  <div class="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-slate-950 font-sans text-slate-100">
    <div class="absolute left-4 top-4 z-50 flex select-none items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-2 shadow-xl backdrop-blur">
      <span class="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
      <div class="text-sm font-semibold tracking-wide text-slate-200">{{ sceneTitle }}</div>
      <el-tag size="small" type="info" effect="dark" class="border-slate-700 bg-slate-800">3D 数字孪生</el-tag>
      <el-button size="small" type="info" plain class="ml-2 border-slate-700 text-slate-300 hover:bg-slate-800" @click="backToEditor">
        返回编辑
      </el-button>
    </div>

    <div ref="canvasContainer" class="h-full w-full"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import request from '../../utils/request'
import type { SceneNodeData, SceneProject } from '../../types/platform'
import { loadImportedModel } from './scene-model-loader'
import { createProceduralMesh } from './scene-mesh-factory'

type SceneNode = SceneNodeData

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const sceneTitle = ref('3D 场景预览')
const sceneNodes = ref<SceneNode[]>([])
const canvasContainer = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationFrameId: number
const modelGroupMap = new Map<string, THREE.Group>()

async function createMeshForNode(node: SceneNode) {
  if ((node.sourceType === 'asset' || node.sourceType === 'imported') && node.sourceUrl) {
    return loadImportedModel(node.sourceUrl)
  }
  return createProceduralMesh(node.type, node.id)
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
      const mesh = await createMeshForNode(node)
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
