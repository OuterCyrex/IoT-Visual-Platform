<template>
  <div class="h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
    <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
      <div class="flex items-center gap-4">
        <el-button text @click="backToList">返回列表</el-button>
        <div>
          <div class="text-sm text-slate-500">3D 场景编辑</div>
          <div class="text-base font-semibold">{{ sceneTitle }}</div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <el-button @click="handleExport">导出 JSON</el-button>
        <el-button @click="handlePreview">预览</el-button>
        <el-button :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </header>

    <div class="grid h-[calc(100vh-4rem)] min-h-0 grid-cols-[320px_1fr_320px]">
      <aside class="overflow-y-auto border-r border-slate-200 bg-white p-4">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-slate-900">3D 素材库</div>
            <div class="mt-1 text-xs text-slate-500">基础组件和组件库资产</div>
          </div>
          <el-button size="small" @click="openAssetLibrary">组件库</el-button>
        </div>

        <el-collapse v-model="sidebarActiveNames">
          <el-collapse-item title="基础组件" name="procedural">
            <div class="pt-3">
              <div
                v-for="item in proceduralLibrary"
                :key="item.type"
                class="mb-2 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-cyan-500 hover:bg-cyan-50"
                @click="addProceduralModel(item)"
              >
                <div class="text-sm font-medium text-slate-900">{{ item.name }}</div>
                <div class="text-xs text-slate-500">{{ item.desc }}</div>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item title="组件库资产" name="assets">
            <div class="pt-3">
              <el-input v-model="assetKeyword" size="small" placeholder="搜索资产名称 / 分类" clearable class="mb-3" />
              <div
                v-for="asset in filteredAssets"
                :key="asset.id"
                class="mb-2 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:border-cyan-500 hover:bg-cyan-50"
                @click="addAssetToScene(asset)"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="text-sm font-medium text-slate-900">{{ asset.name }}</div>
                  <el-tag size="small" effect="dark">{{ asset.format.toUpperCase() }}</el-tag>
                </div>
                <div class="mt-1 text-xs text-slate-500">{{ asset.category || '未分类' }}</div>
              </div>
              <el-empty v-if="!filteredAssets.length" description="暂无可用资产" :image-size="60" />
            </div>
          </el-collapse-item>
        </el-collapse>
      </aside>

      <main class="relative flex min-h-0 min-w-0 flex-col bg-slate-100 p-4">
        <div class="mb-3 flex items-center justify-between">
          <div class="text-sm text-slate-700">场景画布</div>
          <div class="flex items-center gap-2 text-xs text-slate-500">
            <span>支持相机漫游与模型平移、旋转、缩放</span>
          </div>
        </div>

        <div
          v-if="selectedNode"
          class="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur"
        >
          <el-button-group>
            <el-button size="small" :type="transformMode === 'translate' ? 'primary' : 'default'" @click="setTransformMode('translate')">移动</el-button>
            <el-button size="small" :type="transformMode === 'rotate' ? 'primary' : 'default'" @click="setTransformMode('rotate')">旋转</el-button>
            <el-button size="small" :type="transformMode === 'scale' ? 'primary' : 'default'" @click="setTransformMode('scale')">缩放</el-button>
          </el-button-group>
        </div>

        <div ref="canvasContainer" class="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-sm"></div>
      </main>

      <aside class="overflow-y-auto border-l border-slate-200 bg-white p-4">
        <div class="mb-4">
          <div class="text-sm font-medium text-slate-900">属性面板</div>
          <div class="mt-1 text-xs text-slate-500">选中模型后可调整位姿并设置数据绑定</div>
        </div>

        <template v-if="selectedNode">
          <el-form label-position="top" size="small">
            <el-form-item label="名称">
              <el-input v-model="selectedNode.name" />
            </el-form-item>

            <div class="grid grid-cols-3 gap-3">
              <el-form-item label="X">
                <el-input-number v-model="selectedNode.position.x" :step="0.1" class="w-full" />
              </el-form-item>
              <el-form-item label="Y">
                <el-input-number v-model="selectedNode.position.y" :step="0.1" class="w-full" />
              </el-form-item>
              <el-form-item label="Z">
                <el-input-number v-model="selectedNode.position.z" :step="0.1" class="w-full" />
              </el-form-item>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <el-form-item label="旋转 X">
                <el-input-number v-model="selectedNode.rotation.x" :step="0.1" class="w-full" />
              </el-form-item>
              <el-form-item label="旋转 Y">
                <el-input-number v-model="selectedNode.rotation.y" :step="0.1" class="w-full" />
              </el-form-item>
              <el-form-item label="旋转 Z">
                <el-input-number v-model="selectedNode.rotation.z" :step="0.1" class="w-full" />
              </el-form-item>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <el-form-item label="缩放 X">
                <el-input-number v-model="selectedNode.scale.x" :step="0.1" :min="0.1" class="w-full" />
              </el-form-item>
              <el-form-item label="缩放 Y">
                <el-input-number v-model="selectedNode.scale.y" :step="0.1" :min="0.1" class="w-full" />
              </el-form-item>
              <el-form-item label="缩放 Z">
                <el-input-number v-model="selectedNode.scale.z" :step="0.1" :min="0.1" class="w-full" />
              </el-form-item>
            </div>

            <el-divider><span class="text-xs text-slate-400">数据配置</span></el-divider>

            <el-form-item label="绑定数据集">
              <el-select
                v-model="selectedNode.props.datasetId"
                placeholder="选择关联数据集"
                clearable
                class="w-full"
                @change="handleDatasetChange"
              >
                <el-option v-for="ds in datasetOptions" :key="ds.id" :label="ds.name" :value="ds.id" />
              </el-select>
            </el-form-item>

            <template v-if="selectedNode.props.datasetId">
              <el-form-item label="告警字段">
                <el-select v-model="selectedNode.props.alarmField" placeholder="选择告警字段" class="w-full">
                  <el-option v-for="col in datasetColumns" :key="col" :label="col" :value="col" />
                </el-select>
              </el-form-item>

              <el-form-item label="速度字段">
                <el-select v-model="selectedNode.props.speedField" placeholder="选择速度字段" class="w-full">
                  <el-option v-for="col in datasetColumns" :key="col" :label="col" :value="col" />
                </el-select>
              </el-form-item>
            </template>

            <el-button class="mt-4 w-full" type="danger" plain @click="deleteSelectedNode">删除模型</el-button>
          </el-form>
        </template>

        <el-empty v-else description="请选择场景中的模型" />
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
  { type: 'cnc', name: 'CNC 机床', desc: '适合绑定运行状态、告警和转速等设备数据' },
  { type: 'arm', name: '机械臂', desc: '适合绑定动作节拍、工位状态和产线任务数据' },
  { type: 'pump', name: '离心泵', desc: '适合绑定转速、流量、温度和设备告警数据' },
  { type: 'conveyor', name: '输送线', desc: '用于表现物料流转、线体节拍和工序衔接' },
  { type: 'storageTank', name: '储罐', desc: '适合化工、能源和液体存储等工业场景' },
  { type: 'pipeSkid', name: '管道 skid', desc: '用于泵站、流体输送和工艺管网场景' },
  { type: 'controlCabinet', name: '控制柜', desc: '适合配电柜、PLC 柜和工业控制终端' },
  { type: 'serverRack', name: '机柜', desc: '用于机房、边缘计算和监控网关场景' },
  { type: 'coolingUnit', name: '精密空调', desc: '适合机房和控制室的环境设备布局' },
  { type: 'workbench', name: '工作台', desc: '适合装配工位、维修工位和质检工位' },
  { type: 'forklift', name: '叉车', desc: '用于厂内搬运、仓储物流和车辆调度场景' },
  { type: 'road', name: '道路', desc: '用于厂区道路、消防通道和物流通道' },
  { type: 'fence', name: '围栏', desc: '适合安全隔离、区域划分和边界表达' },
  { type: 'lampPost', name: '路灯', desc: '用于厂区外场照明和道路节点标识' },
  { type: 'factoryHall', name: '厂房', desc: '适合搭建总装车间、加工车间和生产主厂房' },
  { type: 'warehouse', name: '仓库', desc: '适合原料仓、成品仓和立体仓储外围布局' },
  { type: 'officeBuilding', name: '办公楼', desc: '用于厂务办公、调度中心和综合楼布局' },
  { type: 'gateComplex', name: '门岗', desc: '用于厂区主入口、门禁和访客通行区域' },
  { type: 'parkingLot', name: '停车区', desc: '适合办公区、访客区和物流车辆停车区域' },
  { type: 'substation', name: '变配电区', desc: '用于配电、变压器和动力基础设施场景' },
  { type: 'loadingDock', name: '装卸月台', desc: '适合仓库装卸、托盘堆垛和收发货区域' },
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
const sidebarActiveNames = ref<string[]>(['procedural', 'assets'])

const filteredAssets = computed(() => {
  if (!assetKeyword.value) return modelAssets.value
  const lower = assetKeyword.value.toLowerCase()
  return modelAssets.value.filter((item) =>
    [item.name, item.category, item.description].some((value) => value.toLowerCase().includes(lower)),
  )
})

const selectedNode = computed(() => sceneNodes.value.find((n) => n.id === selectedId.value) || null)

const canvasContainer = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let transformControls: TransformControls
let animationFrameId = 0
const modelGroupMap = new Map<string, THREE.Object3D>()

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let mouseDownTime = 0
let mouseDownPos = { x: 0, y: 0 }

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

  dom.addEventListener('mousedown', (event) => {
    mouseDownTime = Date.now()
    mouseDownPos = { x: event.clientX, y: event.clientY }
  })

  dom.addEventListener('mouseup', (event) => {
    if (transformControls?.dragging) return

    const elapsed = Date.now() - mouseDownTime
    const distance = Math.hypot(event.clientX - mouseDownPos.x, event.clientY - mouseDownPos.y)
    if (elapsed >= 200 || distance >= 3) return

    const rect = dom.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      let rootObject: THREE.Object3D | null = intersects[0].object
      while (rootObject && rootObject.parent && rootObject.parent !== scene) {
        rootObject = rootObject.parent
      }
      if (rootObject && modelGroupMap.has(rootObject.name)) {
        selectedId.value = rootObject.name
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
  sceneNodes.value = sceneNodes.value.filter((item) => item.id !== id)
  selectedId.value = null
  ElMessage.success('已删除该模型')
}

watch(
  () => sceneNodes.value,
  (nodes) => {
    nodes.forEach((node) => {
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
  const res: any = await request.get('/api/datasets')
  datasetOptions.value = res.items || []
}

async function fetchModelAssets() {
  const res: any = await request.get('/api/model-assets')
  modelAssets.value = res.items || []
}

async function handleDatasetChange(datasetId: string) {
  if (selectedNode.value) {
    selectedNode.value.props.alarmField = undefined
    selectedNode.value.props.speedField = undefined
  }
  datasetColumns.value = []
  if (!datasetId) return
  const res: any = await request.get(`/api/datasets/${datasetId}/preview`)
  datasetColumns.value = res.columns || []
}

watch(
  () => selectedNode.value?.props.datasetId,
  async (datasetId) => {
    datasetColumns.value = []
    if (!datasetId) return
    const res: any = await request.get(`/api/datasets/${datasetId}/preview`)
    datasetColumns.value = res.columns || []
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
  } catch (error) {
    console.error('保存失败:', error)
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
  } catch (error) {
    console.error(error)
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
  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
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
:deep(.el-collapse) {
  --el-collapse-border-color: #e2e8f0;
  --el-collapse-header-bg-color: #ffffff;
  --el-collapse-content-bg-color: #ffffff;
  --el-collapse-header-text-color: #0f172a;
  --el-collapse-content-text-color: #475569;
}

:deep(.el-collapse-item__header) {
  background: #ffffff;
  color: #0f172a;
  font-weight: 600;
}

:deep(.el-collapse-item__wrap) {
  background: #ffffff;
}

:deep(.el-collapse-item__content) {
  color: #475569;
}

:deep(.el-form-item__label) {
  color: #475569;
}
</style>
