<template>
  <div class="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 font-sans text-slate-100">
    <header class="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 backdrop-blur">
      <div class="flex items-center gap-3">
        <el-button size="small" type="info" plain class="border-slate-700 bg-slate-800 text-slate-200" @click="backToList">
          返回列表
        </el-button>
        <span class="text-slate-400">/</span>
        <div class="text-sm font-semibold tracking-wide text-slate-200">{{ sceneTitle }}</div>
      </div>
      <div class="flex items-center gap-3">
        <el-button size="small" @click="openAssetLibrary">3D 组件库</el-button>
        <el-button size="small" type="info" plain @click="handleExport">导出 JSON</el-button>
        <el-button size="small" type="primary" :loading="saving" @click="handleSave">保存场景</el-button>
        <el-button
          size="small"
          type="success"
          plain
          class="border-emerald-800 bg-emerald-950/20 text-emerald-400"
          @click="handlePreview"
        >
          进入 3D 预览
        </el-button>
      </div>
    </header>

    <div class="flex min-h-0 min-w-0 flex-1">
      <aside class="flex w-72 flex-col gap-4 border-r border-slate-800 bg-slate-900/40 p-4">
        <div>
          <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">基础组件</div>
          <div class="text-[11px] text-slate-500">可直接绑定数据源的程序化组件</div>
        </div>

        <div class="space-y-3">
          <div
            v-for="item in proceduralLibrary"
            :key="item.type"
            class="group cursor-pointer select-none rounded-lg border border-slate-800/80 bg-slate-900/50 p-3 transition-all hover:border-slate-700 hover:bg-slate-800/60"
            @click="addProceduralModel(item)"
          >
            <div class="flex items-center gap-3">
              <div class="flex h-8 w-8 items-center justify-center rounded bg-cyan-500/10 text-cyan-400 transition-transform group-hover:scale-105">
                <span class="text-lg font-bold">3D</span>
              </div>
              <div>
                <div class="text-xs font-medium text-slate-200">{{ item.name }}</div>
                <div class="text-[10px] text-slate-500">{{ item.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-800 pt-4">
          <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">组件库资产</div>
          <div class="mb-3 text-[11px] text-slate-500">来自 3D 组件库的可复用模型资产</div>
          <div class="mb-3">
            <el-input v-model="assetKeyword" size="small" placeholder="搜索资产名称 / 分类" clearable />
          </div>
          <div class="flex-1 space-y-3 overflow-y-auto pr-1">
            <div
              v-for="asset in filteredAssets"
              :key="asset.id"
              class="group cursor-pointer select-none rounded-lg border border-slate-800/80 bg-slate-900/50 p-3 transition-all hover:border-slate-700 hover:bg-slate-800/60"
              @click="addAssetToScene(asset)"
            >
              <div class="flex items-start justify-between gap-3">
                <div>
                  <div class="text-xs font-medium text-slate-200">{{ asset.name }}</div>
                  <div class="text-[10px] text-slate-500">{{ asset.category || '未分类' }}</div>
                </div>
                <el-tag size="small" effect="dark">{{ asset.format.toUpperCase() }}</el-tag>
              </div>
            </div>
            <el-empty v-if="!filteredAssets.length" description="暂无可用资产" :image-size="60" />
          </div>
        </div>
      </aside>

      <main class="relative flex-1 bg-slate-950">
        <div class="pointer-events-none absolute left-4 top-4 z-10 flex flex-col gap-1 rounded border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[10px] text-slate-400 shadow-lg backdrop-blur">
          <div class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span><span>左键旋转视角</span></div>
          <div class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span><span>右键平移视角</span></div>
          <div class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span><span>滚轮缩放视图</span></div>
          <div class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-cyan-400"></span><span>单击选中模型</span></div>
          <div class="flex items-center gap-1.5"><span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span><span>选中后可拖拽、旋转、缩放</span></div>
        </div>

        <div
          v-if="selectedNode"
          class="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-700 bg-slate-900/90 px-3 py-2 shadow-lg backdrop-blur"
        >
          <el-button-group>
            <el-button size="small" :type="transformMode === 'translate' ? 'primary' : 'default'" @click="setTransformMode('translate')">移动</el-button>
            <el-button size="small" :type="transformMode === 'rotate' ? 'primary' : 'default'" @click="setTransformMode('rotate')">旋转</el-button>
            <el-button size="small" :type="transformMode === 'scale' ? 'primary' : 'default'" @click="setTransformMode('scale')">缩放</el-button>
          </el-button-group>
        </div>

        <div ref="canvasContainer" class="h-full w-full cursor-grab active:cursor-grabbing"></div>
      </main>

      <aside class="flex w-80 flex-col gap-5 overflow-y-auto border-l border-slate-800 bg-slate-900/40 p-5">
        <template v-if="selectedNode">
          <div>
            <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">基础属性</div>
            <div class="text-[11px] text-slate-400">设备唯一标识：{{ selectedNode.id.substring(0, 8) }}...</div>
            <div class="mt-1 text-[11px] text-slate-500">
              来源：
              {{ selectedNode.sourceType === 'asset' ? '组件库资产' : selectedNode.sourceType === 'imported' ? '兼容旧导入模型' : '基础组件' }}
            </div>
          </div>

          <el-form label-position="top" size="small">
            <el-form-item label="设备名称">
              <el-input v-model="selectedNode.name" placeholder="输入设备名称" class="dark-input" />
            </el-form-item>

            <div class="mt-3 border-t border-slate-800/80 pt-3">
              <div class="mb-2 text-xs text-slate-400">坐标位置 (Position)</div>
              <div class="grid grid-cols-3 gap-2">
                <el-form-item label="X"><el-input-number v-model="selectedNode.position.x" :precision="1" :step="0.5" class="w-full" controls-position="right" /></el-form-item>
                <el-form-item label="Y"><el-input-number v-model="selectedNode.position.y" :precision="1" :step="0.5" class="w-full" controls-position="right" /></el-form-item>
                <el-form-item label="Z"><el-input-number v-model="selectedNode.position.z" :precision="1" :step="0.5" class="w-full" controls-position="right" /></el-form-item>
              </div>
            </div>

            <div class="mt-3 border-t border-slate-800/80 pt-3">
              <div class="mb-2 text-xs text-slate-400">旋转角度 (Rotation)</div>
              <div class="grid grid-cols-3 gap-2">
                <el-form-item label="X"><el-input-number v-model="selectedNode.rotation.x" :precision="2" :step="0.1" class="w-full" controls-position="right" /></el-form-item>
                <el-form-item label="Y"><el-input-number v-model="selectedNode.rotation.y" :precision="2" :step="0.1" class="w-full" controls-position="right" /></el-form-item>
                <el-form-item label="Z"><el-input-number v-model="selectedNode.rotation.z" :precision="2" :step="0.1" class="w-full" controls-position="right" /></el-form-item>
              </div>
            </div>

            <div class="mt-3 border-t border-slate-800/80 pt-3">
              <div class="mb-2 text-xs text-slate-400">缩放比例 (Scale)</div>
              <div class="grid grid-cols-3 gap-2">
                <el-form-item label="X"><el-input-number v-model="selectedNode.scale.x" :precision="2" :step="0.1" :min="0.1" class="w-full" controls-position="right" /></el-form-item>
                <el-form-item label="Y"><el-input-number v-model="selectedNode.scale.y" :precision="2" :step="0.1" :min="0.1" class="w-full" controls-position="right" /></el-form-item>
                <el-form-item label="Z"><el-input-number v-model="selectedNode.scale.z" :precision="2" :step="0.1" :min="0.1" class="w-full" controls-position="right" /></el-form-item>
              </div>
            </div>

            <div class="mt-3 space-y-3 border-t border-slate-800/80 pt-3">
              <div class="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">物理数据关联</div>
              <el-form-item label="绑定数据集">
                <el-select v-model="selectedNode.props.datasetId" placeholder="选择关联数据集" class="w-full" @change="handleDatasetChange">
                  <el-option v-for="opt in datasetOptions" :key="opt.id" :label="opt.name" :value="opt.id" />
                </el-select>
              </el-form-item>

              <template v-if="selectedNode.props.datasetId">
                <el-form-item label="报警判定列">
                  <el-select v-model="selectedNode.props.alarmField" placeholder="选择用于报警的列" class="w-full">
                    <el-option v-for="col in datasetColumns" :key="col" :label="col" :value="col" />
                  </el-select>
                </el-form-item>

                <el-form-item label="速度绑定列">
                  <el-select v-model="selectedNode.props.speedField" placeholder="选择设备转速列" class="w-full">
                    <el-option v-for="col in datasetColumns" :key="col" :label="col" :value="col" />
                  </el-select>
                </el-form-item>
              </template>
            </div>

            <el-button class="mt-6 w-full" type="danger" plain @click="deleteSelectedNode">删除该 3D 设备</el-button>
          </el-form>
        </template>
        <el-empty v-else description="请在场景中单击选择设备" class="my-auto text-slate-500" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import request from '../../utils/request'
import type { Dataset, ModelAsset, SceneNodeData, SceneProject } from '../../types/platform'
import { loadImportedModel } from './scene-model-loader'
import { createProceduralMesh } from './scene-mesh-factory'

type SceneNode = SceneNodeData & {
  props: {
    datasetId?: string
    alarmField?: string
    speedField?: string
  }
}

type ProceduralLibraryItem = {
  type: string
  name: string
  desc: string
}

type TransformMode = 'translate' | 'rotate' | 'scale'

const proceduralLibrary: ProceduralLibraryItem[] = [
  { type: 'cnc', name: 'CNC 机床', desc: '适合绑定运行状态、告警和转速数据' },
  { type: 'arm', name: '机械臂', desc: '适合绑定动作节拍、工位状态等数据' },
  { type: 'pump', name: '离心泵', desc: '适合绑定转速、流量和设备告警数据' },
]

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const sceneTitle = ref('加载中...')
const projectDetail = ref<SceneProject | null>(null)
const sceneNodes = ref<SceneNode[]>([])
const selectedId = ref<string | null>(null)
const saving = ref(false)
const datasetOptions = ref<Dataset[]>([])
const datasetColumns = ref<string[]>([])
const assetKeyword = ref('')
const modelAssets = ref<ModelAsset[]>([])
const transformMode = ref<TransformMode>('translate')

const filteredAssets = computed(() => {
  if (!assetKeyword.value) return modelAssets.value
  const lower = assetKeyword.value.toLowerCase()
  return modelAssets.value.filter((item) =>
    [item.name, item.category, item.description].some((value) => value.toLowerCase().includes(lower)),
  )
})

const canvasContainer = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let transformControls: TransformControls
let animationFrameId: number
const modelGroupMap = new Map<string, THREE.Group>()

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let mouseDownTime = 0
let mouseDownPos = { x: 0, y: 0 }

const selectedNode = computed(() => sceneNodes.value.find((n) => n.id === selectedId.value) || null)

function setTransformMode(mode: TransformMode) {
  transformMode.value = mode
  transformControls?.setMode(mode)
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

function syncNodeFromMesh(node: SceneNode, mesh: THREE.Object3D) {
  node.position.x = Number(mesh.position.x.toFixed(2))
  node.position.y = Number(mesh.position.y.toFixed(2))
  node.position.z = Number(mesh.position.z.toFixed(2))
  node.rotation.x = Number(mesh.rotation.x.toFixed(3))
  node.rotation.y = Number(mesh.rotation.y.toFixed(3))
  node.rotation.z = Number(mesh.rotation.z.toFixed(3))
  node.scale.x = Number(mesh.scale.x.toFixed(3))
  node.scale.y = Number(mesh.scale.y.toFixed(3))
  node.scale.z = Number(mesh.scale.z.toFixed(3))
}

async function mountNode(node: SceneNode) {
  const mesh = await createMeshForNode(node)
  applyNodeTransform(mesh, node)
  scene.add(mesh)
  modelGroupMap.set(node.id, mesh)
}

function removeNodeMesh(id: string) {
  const mesh = modelGroupMap.get(id)
  if (!mesh) return
  if (transformControls.object === mesh) {
    transformControls.detach()
  }
  scene.remove(mesh)
  modelGroupMap.delete(id)
}

function attachTransformControls(id: string | null) {
  if (!transformControls) return
  if (!id) {
    transformControls.detach()
    return
  }
  const mesh = modelGroupMap.get(id)
  if (!mesh) {
    transformControls.detach()
    return
  }
  transformControls.attach(mesh)
  transformControls.setMode(transformMode.value)
}

function setupInteraction() {
  const dom = renderer.domElement

  dom.addEventListener('mousedown', (e) => {
    mouseDownTime = Date.now()
    mouseDownPos = { x: e.clientX, y: e.clientY }
  })

  dom.addEventListener('mouseup', (e) => {
    if (transformControls?.dragging) return

    const elapsed = Date.now() - mouseDownTime
    const distance = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y)
    if (elapsed >= 200 || distance >= 3) return

    const rect = dom.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      let rootGroup: THREE.Object3D | null = intersects[0].object
      while (rootGroup && rootGroup.parent && rootGroup.parent !== scene) {
        rootGroup = rootGroup.parent
      }
      if (rootGroup && modelGroupMap.has(rootGroup.name)) {
        selectedId.value = rootGroup.name
        return
      }
    }

    selectedId.value = null
  })
}

function createBaseNode(partial: Partial<SceneNode>): SceneNode {
  return {
    id: `node-${crypto.randomUUID()}`,
    name: partial.name ?? '未命名设备',
    type: partial.type ?? 'custom',
    sourceType: partial.sourceType,
    assetId: partial.assetId,
    sourceUrl: partial.sourceUrl,
    position: partial.position ?? { x: (Math.random() - 0.5) * 8, y: 0, z: (Math.random() - 0.5) * 8 },
    rotation: partial.rotation ?? { x: 0, y: 0, z: 0 },
    scale: partial.scale ?? { x: 1, y: 1, z: 1 },
    props: partial.props ?? {},
  }
}

async function addProceduralModel(item: ProceduralLibraryItem) {
  const node = createBaseNode({
    name: item.name,
    type: item.type,
    sourceType: 'procedural',
  })
  sceneNodes.value.push(node)
  selectedId.value = node.id
  await mountNode(node)
  attachTransformControls(node.id)
  ElMessage.success(`已添加基础组件：${item.name}`)
}

async function addAssetToScene(asset: ModelAsset) {
  const node = createBaseNode({
    name: asset.name,
    type: 'asset-model',
    sourceType: 'asset',
    assetId: asset.id,
    sourceUrl: asset.fileUrl,
  })
  sceneNodes.value.push(node)
  selectedId.value = node.id
  await mountNode(node)
  attachTransformControls(node.id)
  ElMessage.success(`已添加组件库模型：${asset.name}`)
}

function deleteSelectedNode() {
  if (!selectedId.value) return
  const id = selectedId.value
  removeNodeMesh(id)
  sceneNodes.value = sceneNodes.value.filter((n) => n.id !== id)
  selectedId.value = null
  ElMessage.success('已删除该设备')
}

watch(
  () => sceneNodes.value,
  (newNodes) => {
    newNodes.forEach((node) => {
      const mesh = modelGroupMap.get(node.id)
      if (mesh) {
        applyNodeTransform(mesh, node)
      }
    })
  },
  { deep: true },
)

watch(selectedId, (newId, oldId) => {
  if (oldId) {
    const oldMesh = modelGroupMap.get(oldId)
    oldMesh?.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissiveIntensity = 0
      }
    })
  }

  if (newId) {
    const newMesh = modelGroupMap.get(newId)
    newMesh?.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.emissive = new THREE.Color(0x06b6d4)
        child.material.emissiveIntensity = 0.2
      }
    })
  }

  attachTransformControls(newId)
})

watch(transformMode, (mode) => {
  transformControls?.setMode(mode)
})

async function fetchDatasetOptions() {
  try {
    const res: any = await request.get('/api/datasets')
    datasetOptions.value = res.items || []
  } catch (err) {
    console.error(err)
  }
}

async function fetchModelAssets() {
  try {
    const res: any = await request.get('/api/model-assets')
    modelAssets.value = res.items || []
  } catch (err) {
    console.error(err)
  }
}

async function handleDatasetChange(datasetId: string) {
  if (selectedNode.value) {
    selectedNode.value.props.alarmField = undefined
    selectedNode.value.props.speedField = undefined
  }
  datasetColumns.value = []
  if (!datasetId) return

  try {
    const res: any = await request.get(`/api/datasets/${datasetId}/preview`)
    datasetColumns.value = res.columns || []
  } catch (err) {
    console.error(err)
  }
}

watch(
  () => selectedNode.value?.props.datasetId,
  async (newDsId) => {
    datasetColumns.value = []
    if (!newDsId) return
    try {
      const res: any = await request.get(`/api/datasets/${newDsId}/preview`)
      datasetColumns.value = res.columns || []
    } catch (err) {
      console.error(err)
    }
  },
)

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
    props: node.props ?? {},
  }))
}

async function loadScene() {
  try {
    const res: any = await request.get(`/api/sceneProjects/${projectId}`)
    projectDetail.value = res.item
    sceneTitle.value = res.item.name
    sceneNodes.value = normalizeSceneNodes(res.item.sceneNodes)

    transformControls?.detach()
    modelGroupMap.forEach((mesh) => scene.remove(mesh))
    modelGroupMap.clear()

    for (const node of sceneNodes.value) {
      await mountNode(node)
    }
    attachTransformControls(selectedId.value)
  } catch (err) {
    console.error(err)
  }
}

async function handleSave() {
  if (!projectDetail.value) return
  saving.value = true
  try {
    await request.put(`/api/sceneProjects/${projectId}`, {
      ...projectDetail.value,
      sceneNodes: sceneNodes.value,
      modelCount: sceneNodes.value.length,
      status: 'editing',
    })
    ElMessage.success('保存成功')
    await loadScene()
  } catch (err) {
    console.error('保存失败:', err)
  } finally {
    saving.value = false
  }
}

async function handleExport() {
  try {
    const res: any = await request.get(`/api/sceneProjects/${projectId}/export`)
    if (res.fileUrl) {
      window.open(new URL(res.fileUrl, String(request.defaults.baseURL)).toString(), '_blank')
    }
  } catch (err) {
    console.error(err)
  }
}

function handlePreview() {
  router.push(`/scenes/${projectId}/preview`)
}

function backToList() {
  router.push('/scenes')
}

function openAssetLibrary() {
  router.push('/scene-assets')
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
  controls.maxPolarAngle = Math.PI / 2 - 0.05

  transformControls = new TransformControls(camera, renderer.domElement)
  transformControls.setMode(transformMode.value)
  transformControls.addEventListener('dragging-changed', (event) => {
    controls.enabled = !event.value
  })
  transformControls.addEventListener('objectChange', () => {
    if (!selectedId.value) return
    const mesh = modelGroupMap.get(selectedId.value)
    const node = selectedNode.value
    if (!mesh || !node) return
    syncNodeFromMesh(node, mesh)
  })
  scene.add(transformControls.getHelper())

  scene.add(new THREE.GridHelper(50, 50, 0x0891b2, 0x1e293b))
  scene.add(new THREE.AmbientLight(0xffffff, 0.35))

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.75)
  dirLight.position.set(15, 25, 10)
  scene.add(dirLight)

  const pointLight = new THREE.PointLight(0x06b6d4, 1, 20)
  pointLight.position.set(0, 5, 0)
  scene.add(pointLight)

  setupInteraction()

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
  await Promise.all([fetchDatasetOptions(), fetchModelAssets()])
  await loadScene()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationFrameId)
  transformControls?.dispose()
  renderer?.dispose()
})
</script>

<style scoped>
.dark-input :deep(.el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.6) !important;
  border-color: rgba(51, 65, 85, 0.8) !important;
  box-shadow: none !important;
}
</style>
