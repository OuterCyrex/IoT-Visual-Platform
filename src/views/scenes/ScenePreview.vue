<template>
  <div class="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
    <div class="absolute left-4 top-4 z-50 flex select-none items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/90 px-4 py-2 shadow-xl backdrop-blur">
      <span class="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-500"></span>
      <div class="text-sm font-semibold tracking-wide text-slate-200">{{ sceneTitle }}</div>
      <el-tag size="small" type="info" effect="dark" class="border-slate-700 bg-slate-800">3D 机房监控</el-tag>
      <el-button size="small" type="info" plain class="ml-2 border-slate-700 text-slate-300 hover:bg-slate-800" @click="backToEditor">
        返回编辑
      </el-button>
    </div>

    <div
      v-for="label in overlayLabels"
      :key="label.id"
      class="pointer-events-none absolute z-40 whitespace-nowrap px-1 text-center text-[12px] leading-5 text-cyan-100"
      :style="{
        left: `${label.x}px`,
        top: `${label.y}px`,
        transform: 'translate(-50%, -100%)',
        display: label.visible ? 'block' : 'none',
        textShadow: '0 1px 2px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)',
      }"
    >
      <div class="font-semibold text-white">{{ label.title }}</div>
      <div>{{ label.primaryText }}</div>
      <div class="text-slate-300">{{ label.secondaryText }}</div>
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

type SceneNodeProps = {
  datasetId?: string
  matchField?: string
  matchValue?: string
  valueField?: string
  valueLabel?: string
  statusField?: string
  secondaryField?: string
  secondaryLabel?: string
  displayTitle?: string
  refreshInterval?: number
}

type SceneNode = SceneNodeData & {
  props: SceneNodeProps
}

type RuntimeRowState = {
  row: Record<string, unknown> | null
}

type OverlayLabel = {
  id: string
  title: string
  primaryText: string
  secondaryText: string
  x: number
  y: number
  visible: boolean
}

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const sceneTitle = ref('3D 机房预览')
const sceneNodes = ref<SceneNode[]>([])
const canvasContainer = ref<HTMLDivElement | null>(null)
const overlayLabels = ref<OverlayLabel[]>([])
const runtimeDataState = ref<Record<string, RuntimeRowState>>({})

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let animationFrameId = 0

const modelGroupMap = new Map<string, THREE.Object3D>()
const refreshTimerMap = new Map<string, number>()

function normalizeSceneNodes(rawNodes: SceneProject['sceneNodes']): SceneNode[] {
  const nodes = typeof rawNodes === 'string' ? JSON.parse(rawNodes) : rawNodes || []
  return nodes.map((node: any) => ({
    id: String(node.id),
    name: String(node.name ?? '未命名设备'),
    type: String(node.type ?? 'custom'),
    sourceType: node.sourceType,
    assetId: node.assetId,
    sourceUrl: node.sourceUrl,
    position: node.position ?? { x: 0, y: 0, z: 0 },
    rotation: node.rotation ?? { x: 0, y: 0, z: 0 },
    scale: node.scale ?? { x: 1, y: 1, z: 1 },
    props: {
      refreshInterval: 5000,
      ...(node.props ?? {}),
    },
  }))
}

async function createMeshForNode(node: SceneNode) {
  if ((node.sourceType === 'asset' || node.sourceType === 'imported') && node.sourceUrl) {
    return loadImportedModel(node.sourceUrl)
  }
  return createProceduralMesh(node.type, node.id)
}

function applyNodeTransform(mesh: THREE.Object3D, node: SceneNode) {
  mesh.name = node.id
  mesh.position.set(node.position.x, node.position.y, node.position.z)
  mesh.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z)
  mesh.scale.set(node.scale.x, node.scale.y, node.scale.z)
}

function getRowFieldValue(row: Record<string, unknown> | null, preferredField?: string) {
  if (!row) return undefined
  if (preferredField && preferredField in row) return row[preferredField]
  const entries = Object.entries(row).filter(([, value]) => value != null && value !== '')
  return entries.length ? entries[0][1] : undefined
}

function getPrimaryText(node: SceneNode, row: Record<string, unknown> | null) {
  const label = node.props.valueLabel || node.props.valueField || '主值'
  const value = getRowFieldValue(row, node.props.valueField)
  return `${label}: ${value == null ? '--' : String(value)}`
}

function getSecondaryText(node: SceneNode, row: Record<string, unknown> | null) {
  const auxLabel = node.props.secondaryLabel || node.props.secondaryField || '辅助'
  const auxValue = getRowFieldValue(row, node.props.secondaryField)
  const statusValue = getRowFieldValue(row, node.props.statusField)
  return `${auxLabel}: ${auxValue == null ? '--' : String(auxValue)} | 状态: ${statusValue == null ? '--' : String(statusValue)}`
}

function pickRow(node: SceneNode, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return null
  const matchField = node.props.matchField
  const matchValue = node.props.matchValue?.trim()
  if (matchField && matchValue) {
    const matched = rows.find((row) => String(row[matchField] ?? '').trim().toLowerCase() === matchValue.toLowerCase())
    if (matched) return matched
  }
  return rows[0]
}

function rebuildOverlayLabels() {
  if (!renderer) return

  overlayLabels.value = sceneNodes.value
    .filter((node) => Boolean(node.props.datasetId))
    .map((node) => {
      const mesh = modelGroupMap.get(node.id)
      if (!mesh) {
        return {
          id: node.id,
          title: node.props.displayTitle || node.name,
          primaryText: '--',
          secondaryText: '--',
          x: 0,
          y: 0,
          visible: false,
        }
      }

      const worldPos = new THREE.Vector3()
      mesh.getWorldPosition(worldPos)
      worldPos.y += Math.max(mesh.scale.y, 1) * 2.5

      const projected = worldPos.project(camera)
      const visible = projected.z > -1 && projected.z < 1
      const x = ((projected.x + 1) / 2) * renderer.domElement.clientWidth
      const y = ((-projected.y + 1) / 2) * renderer.domElement.clientHeight
      const row = runtimeDataState.value[node.id]?.row ?? null

      return {
        id: node.id,
        title: node.props.displayTitle || node.name,
        primaryText: getPrimaryText(node, row),
        secondaryText: getSecondaryText(node, row),
        x,
        y,
        visible,
      }
    })
}

async function fetchNodeData(node: SceneNode) {
  const datasetId = node.props.datasetId
  if (!datasetId) return

  try {
    const res: any = await request.get(`/api/datasets/${datasetId}/preview`)
    const rows = Array.isArray(res.rows) ? res.rows : []
    const row = pickRow(node, rows)
    runtimeDataState.value = {
      ...runtimeDataState.value,
      [node.id]: { row },
    }
    rebuildOverlayLabels()
  } catch (error) {
    console.error(`3D node dataset refresh failed: ${node.id}`, error)
  }
}

function clearRefreshTimers() {
  refreshTimerMap.forEach((timerId) => window.clearInterval(timerId))
  refreshTimerMap.clear()
}

function setupRefreshTimers() {
  clearRefreshTimers()
  sceneNodes.value.forEach((node) => {
    if (!node.props.datasetId) return
    fetchNodeData(node)
    const interval = Math.max(Number(node.props.refreshInterval || 5000), 1000)
    const timerId = window.setInterval(() => {
      fetchNodeData(node)
    }, interval)
    refreshTimerMap.set(node.id, timerId)
  })
}

async function loadProject() {
  try {
    const res: any = await request.get(`/api/sceneProjects/${projectId}`)
    const item = res.item as SceneProject
    sceneTitle.value = item.name
    sceneNodes.value = normalizeSceneNodes(item.sceneNodes)

    runtimeDataState.value = {}
    overlayLabels.value = []
    modelGroupMap.forEach((mesh) => scene.remove(mesh))
    modelGroupMap.clear()

    for (const node of sceneNodes.value) {
      const mesh = await createMeshForNode(node)
      applyNodeTransform(mesh, node)
      scene.add(mesh)
      modelGroupMap.set(node.id, mesh)
    }

    rebuildOverlayLabels()
    setupRefreshTimers()
  } catch (error) {
    console.error(error)
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
  camera.position.set(14, 12, 18)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(width, height)
  renderer.setClearColor(0x020617, 1)
  canvasContainer.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.maxPolarAngle = Math.PI / 2 - 0.05

  scene.add(new THREE.GridHelper(80, 80, 0x0891b2, 0x1e293b))
  scene.add(new THREE.AmbientLight(0xffffff, 0.38))

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.82)
  dirLight.position.set(30, 40, 12)
  scene.add(dirLight)

  const pointLight = new THREE.PointLight(0x06b6d4, 1.1, 28)
  pointLight.position.set(0, 8, 0)
  scene.add(pointLight)

  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    controls.update()
    rebuildOverlayLabels()
    renderer.render(scene, camera)
  }
  animate()
}

function handleResize() {
  if (!canvasContainer.value || !renderer || !camera) return
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  rebuildOverlayLabels()
}

onMounted(async () => {
  initThree()
  await loadProject()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationFrameId)
  clearRefreshTimers()
  renderer?.dispose()
})
</script>
