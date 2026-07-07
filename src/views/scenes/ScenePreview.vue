<template>
  <div class="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans">
    <!-- Top Floating Toolbar -->
    <div class="absolute top-4 left-4 z-50 flex items-center gap-3 rounded-lg bg-slate-900/90 px-4 py-2 backdrop-blur border border-slate-800 shadow-xl select-none">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
      <div class="text-sm font-semibold tracking-wide text-slate-200">{{ sceneTitle }}</div>
      <el-tag size="small" type="info" effect="dark" class="border-slate-700 bg-slate-800">3D 数字孪生</el-tag>
      <el-button size="small" type="info" plain class="ml-2 hover:bg-slate-800 border-slate-700 text-slate-300" @click="backToEditor">
        返回编辑
      </el-button>
    </div>

    <!-- 3D Viewport Container -->
    <div ref="canvasContainer" class="w-full h-full"></div>

    <!-- Projected 2D Floating HUD Labels Overlay -->
    <div class="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      <div
        v-for="hud in projectedNodes"
        :key="hud.id"
        v-show="hud.visible"
        class="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center gap-1 transition-all duration-75"
        :style="{ left: hud.left, top: hud.top }"
      >
        <!-- Telemetry Card -->
        <div
          class="rounded-lg border px-3 py-2 shadow-2xl backdrop-blur-md w-48 text-left transition-all duration-300 pointer-events-auto"
          :class="[
            hud.alarmActive
              ? 'border-red-500/50 bg-red-950/70 shadow-red-900/10'
              : 'border-slate-800/80 bg-slate-900/80 shadow-black/40'
          ]"
        >
          <!-- Title & Type -->
          <div class="flex items-center justify-between gap-2 border-b pb-1 mb-1.5" :class="hud.alarmActive ? 'border-red-800/50' : 'border-slate-800'">
            <span class="text-xs font-bold text-slate-100 truncate w-2/3">{{ hud.name }}</span>
            <span class="text-[9px] uppercase font-semibold text-slate-500">{{ hud.type }}</span>
          </div>

          <!-- Value display -->
          <div class="space-y-1">
            <div v-if="hud.telemetryText" class="text-[10px] text-cyan-400 font-mono flex justify-between">
              <span class="text-slate-400">电耗指标</span>
              <span>{{ hud.telemetryText }}</span>
            </div>
            
            <div v-if="hud.alarmActive" class="text-[10px] text-red-400 font-medium flex items-start gap-1 mt-1 animate-pulse">
              <span>⚠️</span>
              <span class="truncate w-full">{{ hud.alarmMsg || '数据指标过高告警' }}</span>
            </div>
            <div v-else class="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>运行状态正常</span>
            </div>
          </div>
        </div>

        <!-- Connecting Line Anchor -->
        <div class="w-px h-8" :class="hud.alarmActive ? 'bg-gradient-to-b from-red-500 to-transparent' : 'bg-gradient-to-b from-slate-600 to-transparent'"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import request from '../../utils/request'
import type { SceneProject } from '../../types/platform'

interface SceneNode {
  id: string
  name: string
  type: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  props: {
    datasetId?: string
    alarmField?: string
    speedField?: string
  }
}

interface HUDNode {
  id: string
  name: string
  type: string
  left: string
  top: string
  visible: boolean
  alarmActive: boolean
  alarmMsg: string
  telemetryText: string
}

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const sceneTitle = ref('大屏画布')
const sceneNodes = ref<SceneNode[]>([])
const datasetData = ref<Record<string, { columns: string[]; rows: any[] }>>({})
const projectedNodes = ref<HUDNode[]>([])

// Three.js instances
const canvasContainer = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationFrameId: number
const modelGroupMap = new Map<string, THREE.Group>()
const timers: any[] = []

// Procedural 3D model generation
function createProceduralMesh(type: string, id: string): THREE.Group {
  const group = new THREE.Group()
  group.name = id

  if (type === 'cnc') {
    // CNC Base: Metallic box
    const baseGeo = new THREE.BoxGeometry(3, 1.8, 2.2)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.y = 0.9
    group.add(baseMesh)

    // Glass panel
    const glassGeo = new THREE.BoxGeometry(2.2, 1, 0.1)
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.9 })
    const glassMesh = new THREE.Mesh(glassGeo, glassMat)
    glassMesh.position.set(0, 1.1, 1.1)
    group.add(glassMesh)

    // Warning light
    const beaconGeo = new THREE.SphereGeometry(0.15, 16, 16)
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.5 })
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat)
    beaconMesh.name = 'beacon'
    beaconMesh.position.set(1.2, 1.9, 0.9)
    group.add(beaconMesh)
  } else if (type === 'arm') {
    // Base platform
    const baseGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.3, 32)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.y = 0.15
    group.add(baseMesh)

    // Vertical shaft
    const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 16)
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat)
    shaftMesh.position.set(0, 1.0, 0)
    group.add(shaftMesh)

    // Upper articulated links (This rotates!)
    const jointGroup = new THREE.Group()
    jointGroup.name = 'joint'
    jointGroup.position.set(0, 1.8, 0)

    const jointGeo = new THREE.BoxGeometry(0.3, 1.2, 0.3)
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, metalness: 0.7 })
    const jointMesh = new THREE.Mesh(jointGeo, jointMat)
    jointMesh.position.set(0.3, 0.6, 0)
    jointMesh.rotation.z = Math.PI / 4
    jointGroup.add(jointMesh)

    group.add(jointGroup)
  } else {
    // Pump motor
    const motorGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.8, 32)
    motorGeo.rotateZ(Math.PI / 2)
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.9, roughness: 0.3 })
    const motorMesh = new THREE.Mesh(motorGeo, motorMat)
    motorMesh.position.y = 0.6
    group.add(motorMesh)

    // Impeller shaft housing (This rotates!)
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

async function fetchDatasetData(dsId: string) {
  try {
    const res: any = await request.get(`/api/datasets/${dsId}/preview`)
    datasetData.value[dsId] = {
      columns: res.columns || [],
      rows: res.rows || []
    }
  } catch (err) {
    console.error(`Failed to fetch dataset ${dsId}:`, err)
  }
}

async function fetchAllDatasetData() {
  const datasetIds = [...new Set(sceneNodes.value.map(n => n.props.datasetId).filter(Boolean))] as string[]
  await Promise.all(datasetIds.map(id => fetchDatasetData(id)))
}

function setupRefreshTimers() {
  timers.forEach(t => clearInterval(t))
  timers.length = 0

  const datasetIds = [...new Set(sceneNodes.value.map(n => n.props.datasetId).filter(Boolean))] as string[]
  datasetIds.forEach((dsId) => {
    const timer = setInterval(() => {
      fetchDatasetData(dsId)
    }, 4000) // Poll every 4 seconds
    timers.push(timer)
  })
}

async function loadProject() {
  try {
    const res: any = await request.get(`/api/sceneProjects/${projectId}`)
    const item = res.item
    if (item) {
      sceneTitle.value = item.name
      sceneNodes.value = typeof item.sceneNodes === 'string' ? JSON.parse(item.sceneNodes) : (item.sceneNodes || [])

      // Clear existing models
      modelGroupMap.forEach(mesh => scene.remove(mesh))
      modelGroupMap.clear()

      // Add models
      sceneNodes.value.forEach((node) => {
        const mesh = createProceduralMesh(node.type, node.id)
        mesh.position.set(node.position.x, node.position.y, node.position.z)
        mesh.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z)
        mesh.scale.set(node.scale.x, node.scale.y, node.scale.z)
        scene.add(mesh)
        modelGroupMap.set(node.id, mesh)
      })

      await fetchAllDatasetData()
      setupRefreshTimers()
    }
  } catch (err) {
    console.error(err)
  }
}

function backToEditor() {
  router.push(`/scenes/${projectId}/editor`)
}

// Coordinate projection helper
const tempV = new THREE.Vector3()

function updateHUDPositions() {
  if (!canvasContainer.value || !camera) return
  const w = canvasContainer.value.clientWidth
  const h = canvasContainer.value.clientHeight

  projectedNodes.value = sceneNodes.value.map((node) => {
    const mesh = modelGroupMap.get(node.id)
    if (!mesh) return null

    // Fetch projected coordinates (position label 2.2 units above base)
    tempV.setFromMatrixPosition(mesh.matrixWorld)
    tempV.y += 2.2

    tempV.project(camera)
    const isBehind = tempV.z > 1

    const px = (tempV.x * 0.5 + 0.5) * w
    const py = (-tempV.y * 0.5 + 0.5) * h

    // Extract dynamic dataset telemetry
    let alarmActive = false
    let alarmMsg = ''
    let telemetryText = ''

    const dsId = node.props.datasetId
    if (dsId && datasetData.value[dsId]) {
      const rows = datasetData.value[dsId].rows || []
      const firstRow = rows[0] || {}

      const alarmCol = node.props.alarmField
      if (alarmCol && firstRow[alarmCol]) {
        const statusVal = String(firstRow[alarmCol]).toLowerCase()
        alarmActive = statusVal === 'active' || statusVal === 'critical' || statusVal === 'warning'
        alarmMsg = String(firstRow['alarm_message'] || firstRow['message'] || '指标触发警报')
      }

      const speedCol = node.props.speedField
      if (speedCol && firstRow[speedCol] !== undefined) {
        telemetryText = `${Number(firstRow[speedCol]).toFixed(1)}`
      }
    }

    return {
      id: node.id,
      name: node.name,
      type: node.type,
      left: `${px}px`,
      top: `${py}px`,
      visible: !isBehind,
      alarmActive,
      alarmMsg,
      telemetryText: telemetryText ? `${telemetryText} kWh` : ''
    }
  }).filter(Boolean) as HUDNode[]
}

// Initialise Three.js Visual Viewport
function initThree() {
  if (!canvasContainer.value) return

  const w = canvasContainer.value.clientWidth
  const h = canvasContainer.value.clientHeight

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x020617, 0.015)

  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000)
  camera.position.set(12, 10, 18)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(w, h)
  renderer.setClearColor(0x020617, 1)
  canvasContainer.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2 - 0.05

  // Cyan futuristic Grid
  const gridHelper = new THREE.GridHelper(50, 50, 0x0891b2, 0x1e293b)
  scene.add(gridHelper)

  // Environment Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(15, 25, 10)
  scene.add(dirLight)

  const clock = new THREE.Clock()

  function animate() {
    animationFrameId = requestAnimationFrame(animate)
    controls.update()

    const elapsed = clock.getElapsedTime()
    const delta = clock.getDelta()

    // Dynamic telemetry rendering loop
    sceneNodes.value.forEach((node) => {
      const mesh = modelGroupMap.get(node.id)
      if (!mesh) return

      let speedValue = 1.0 // Default idle rotation speed

      // Extract telemetry values
      const dsId = node.props.datasetId
      if (dsId && datasetData.value[dsId]) {
        const rows = datasetData.value[dsId].rows || []
        const firstRow = rows[0] || {}

        // Bind animation speed to electric power or numeric columns
        const speedCol = node.props.speedField
        if (speedCol && firstRow[speedCol] !== undefined) {
          const val = Number(firstRow[speedCol]) || 0
          speedValue = Math.min(val / 200, 10) // Map to scaling factor (cap speed)
        }

        // Bind alarm flashing status
        const alarmCol = node.props.alarmField
        const beacon = mesh.getObjectByName('beacon') as THREE.Mesh
        if (beacon && beacon.material) {
          const statusVal = String(firstRow[alarmCol || ''] || '').toLowerCase()
          const isActive = statusVal === 'active' || statusVal === 'critical' || statusVal === 'warning'
          
          if (isActive) {
            // Pulsing warning red light
            (beacon.material as any).color.setHex(0xef4444);
            (beacon.material as any).emissive.setHex(0xef4444);
            (beacon.material as any).emissiveIntensity = Math.abs(Math.sin(elapsed * 8)) * 1.5
          } else {
            // Steady green status light
            (beacon.material as any).color.setHex(0x22c55e);
            (beacon.material as any).emissive.setHex(0x22c55e);
            (beacon.material as any).emissiveIntensity = 0.5
          }
        }
      }

      // Perform animations on submeshes
      if (node.type === 'arm') {
        const joint = mesh.getObjectByName('joint')
        if (joint) {
          // Swing robotic arm back and forth based on speed value
          joint.rotation.y = Math.sin(elapsed * speedValue * 1.5) * 0.6
        }
      } else if (node.type === 'pump') {
        const rotor = mesh.getObjectByName('rotor')
        if (rotor) {
          // Spin impeller based on speed value
          rotor.rotation.x += speedValue * 0.1
        }
      }
    })

    // Project coordinates
    updateHUDPositions()

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
  timers.forEach(t => clearInterval(t))
})
</script>

<style scoped>
:deep(body) {
  margin: 0;
  padding: 0;
}
</style>
