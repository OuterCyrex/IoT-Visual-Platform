<template>
  <div class="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans">
    <!-- Top Header -->
    <header class="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6 backdrop-blur">
      <div class="flex items-center gap-3">
        <el-button size="small" type="info" plain class="border-slate-700 bg-slate-800 text-slate-200" @click="backToList">
          返回列表
        </el-button>
        <span class="text-slate-400">/</span>
        <div class="text-sm font-semibold tracking-wide text-slate-200">{{ sceneTitle }}</div>
      </div>
      <div class="flex items-center gap-3">
        <el-button size="small" type="primary" :loading="saving" @click="handleSave">
          保存场景
        </el-button>
        <el-button size="small" type="success" plain class="border-emerald-800 bg-emerald-950/20 text-emerald-400" @click="handlePreview">
          进入三维预览
        </el-button>
      </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex flex-1 min-h-0 min-w-0">
      <!-- Left Sidebar: 3D Model Palette -->
      <aside class="w-64 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-4">
        <div>
          <div class="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">三维模型库</div>
          <div class="text-[11px] text-slate-500">点击以下模型即可添加到 3D 网格中心</div>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 pr-1">
          <div
            v-for="item in modelLibrary"
            :key="item.type"
            class="flex items-center gap-3 p-3 rounded-lg border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-700 cursor-pointer transition-all group select-none"
            @click="addModelToScene(item.type)"
          >
            <div class="w-8 h-8 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <span class="text-lg font-bold">3D</span>
            </div>
            <div>
              <div class="text-xs font-medium text-slate-200">{{ item.name }}</div>
              <div class="text-[10px] text-slate-500">{{ item.desc }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Center 3D Viewport -->
      <main class="flex-1 relative bg-slate-950">
        <!-- Floating Hints -->
        <div class="absolute top-4 left-4 z-10 pointer-events-none bg-slate-900/80 px-3 py-1.5 rounded border border-slate-800 text-[10px] text-slate-400 flex flex-col gap-1 backdrop-blur shadow-lg">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>拖拽鼠标左键旋转视角</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>拖拽鼠标右键平移视角</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>滚动鼠标滚轮缩放视图</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>鼠标左键单击选中场景中的设备模型</span>
          </div>
        </div>

        <div ref="canvasContainer" class="w-full h-full cursor-grab active:cursor-grabbing"></div>
      </main>

      <!-- Right Sidebar: Properties & Data Bindings -->
      <aside class="w-80 border-l border-slate-800 bg-slate-900/40 p-5 flex flex-col gap-5 overflow-y-auto">
        <template v-if="selectedNode">
          <div>
            <div class="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">基本属性</div>
            <div class="text-[11px] text-slate-400">设备唯一标识: {{ selectedNode.id.substring(0, 8) }}...</div>
          </div>

          <el-form label-position="top" size="small">
            <el-form-item label="设备名称">
              <el-input v-model="selectedNode.name" placeholder="输入设备名称" class="dark-input" />
            </el-form-item>

            <!-- Position Coordinates -->
            <div class="border-t border-slate-800/80 pt-3 mt-3">
              <div class="text-xs text-slate-400 mb-2">坐标位置 (Position)</div>
              <div class="grid grid-cols-3 gap-2">
                <el-form-item label="X">
                  <el-input-number v-model="selectedNode.position.x" :precision="1" :step="0.5" class="w-full" controls-position="right" />
                </el-form-item>
                <el-form-item label="Y">
                  <el-input-number v-model="selectedNode.position.y" :precision="1" :step="0.5" class="w-full" controls-position="right" />
                </el-form-item>
                <el-form-item label="Z">
                  <el-input-number v-model="selectedNode.position.z" :precision="1" :step="0.5" class="w-full" controls-position="right" />
                </el-form-item>
              </div>
            </div>

            <!-- Rotation & Scale -->
            <div class="grid grid-cols-2 gap-3 mt-2">
              <el-form-item label="旋转 (Rotate Y)">
                <el-input-number v-model="selectedNode.rotation.y" :precision="2" :step="0.1" class="w-full" controls-position="right" />
              </el-form-item>
              <el-form-item label="缩放比例 (Scale)">
                <el-input-number v-model="selectedNode.scale.x" :precision="1" :step="0.1" :min="0.1" class="w-full" controls-position="right" @change="syncScale" />
              </el-form-item>
            </div>

            <!-- Data Bindings -->
            <div class="border-t border-slate-800/80 pt-3 mt-3 space-y-3">
              <div class="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">物理数据关联</div>

              <el-form-item label="绑定数据集">
                <el-select v-model="selectedNode.props.datasetId" placeholder="选择关联数据集" class="w-full" @change="handleDatasetChange">
                  <el-option
                    v-for="opt in datasetOptions"
                    :key="opt.id"
                    :label="opt.name"
                    :value="opt.id"
                  />
                </el-select>
              </el-form-item>

              <template v-if="selectedNode.props.datasetId">
                <!-- Status Flashing Binding -->
                <el-form-item label="警报闪烁判定列">
                  <el-select v-model="selectedNode.props.alarmField" placeholder="选择判定状态的列" class="w-full">
                    <el-option v-for="col in datasetColumns" :key="col" :label="col" :value="col" />
                  </el-select>
                </el-form-item>

                <!-- Speed Rotor Binding -->
                <el-form-item label="速度旋转绑定列">
                  <el-select v-model="selectedNode.props.speedField" placeholder="选择物理转速列" class="w-full">
                    <el-option v-for="col in datasetColumns" :key="col" :label="col" :value="col" />
                  </el-select>
                </el-form-item>
              </template>
            </div>

            <el-button class="w-full mt-6" type="danger" plain @click="deleteSelectedNode">
              删除此 3D 设备
            </el-button>
          </el-form>
        </template>
        <el-empty v-else description="请在场景中单击选择设备" class="my-auto text-slate-500" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import request from '../../utils/request'
import type { SceneProject, Dataset } from '../../types/platform'

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

const modelLibrary = [
  { type: 'cnc', name: 'CNC机床', desc: '包含刀头与警示指示灯' },
  { type: 'arm', name: '机械手臂', desc: '包含关节支撑柱结构' },
  { type: 'pump', name: '离心泵机', desc: '包含驱动电机与离心涡轮' }
]

// Three.js instances
const canvasContainer = ref<HTMLDivElement | null>(null)
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
const modelGroupMap = new Map<string, THREE.Group>()

const selectedNode = computed(() => {
  return sceneNodes.value.find(n => n.id === selectedId.value) || null
})

function syncScale(val: number | null) {
  if (!selectedNode.value || val === null) return
  selectedNode.value.scale.y = val
  selectedNode.value.scale.z = val
}

// Procedural 3D Geometries Generator
function createProceduralMesh(type: string, id: string): THREE.Group {
  const group = new THREE.Group()
  group.name = id

  if (type === 'cnc') {
    // CNC Base: Metallic dark grey box
    const baseGeo = new THREE.BoxGeometry(3, 1.8, 2.2)
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.8 })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.y = 0.9
    group.add(baseMesh)

    // Glass panel: Cyan translucent glass
    const glassGeo = new THREE.BoxGeometry(2.2, 1, 0.1)
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.5, roughness: 0.1, metalness: 0.9 })
    const glassMesh = new THREE.Mesh(glassGeo, glassMat)
    glassMesh.position.set(0, 1.1, 1.1)
    group.add(glassMesh)

    // Status warning beacon: Sphere on top
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

    // Vertical shaft segment
    const shaftGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 16)
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    const shaftMesh = new THREE.Mesh(shaftGeo, shaftMat)
    shaftMesh.position.set(0, 1.0, 0)
    group.add(shaftMesh)

    // Upper articulated armature link
    const jointGeo = new THREE.BoxGeometry(0.3, 1.2, 0.3)
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x0891b2, metalness: 0.7 })
    const jointMesh = new THREE.Mesh(jointGeo, jointMat)
    jointMesh.position.set(0.3, 1.6, 0)
    jointMesh.rotation.z = Math.PI / 4
    group.add(jointMesh)
  } else {
    // Pump motor horizontally lying
    const motorGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.8, 32)
    motorGeo.rotateZ(Math.PI / 2)
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, metalness: 0.9, roughness: 0.3 })
    const motorMesh = new THREE.Mesh(motorGeo, motorMat)
    motorMesh.position.y = 0.6
    group.add(motorMesh)

    // Rotor/fan guard on side
    const fanGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.3, 32)
    fanGeo.rotateZ(Math.PI / 2)
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 })
    const fanMesh = new THREE.Mesh(fanGeo, fanMat)
    fanMesh.position.set(-1.05, 0.6, 0)
    group.add(fanMesh)
  }

  return group
}

// Raycaster pointer picking
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let mouseDownTime = 0
let mouseDownPos = { x: 0, y: 0 }

function setupInteraction() {
  if (!renderer) return
  const dom = renderer.domElement

  dom.addEventListener('mousedown', (e) => {
    mouseDownTime = Date.now()
    mouseDownPos = { x: e.clientX, y: e.clientY }
  })

  dom.addEventListener('mouseup', (e) => {
    const elapsed = Date.now() - mouseDownTime
    const distance = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y)

    // Only pick if mouse was clicked (not dragged to navigate camera)
    if (elapsed < 200 && distance < 3) {
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
    }
  })
}

// Add equipment to viewport
function addModelToScene(type: string) {
  const node: SceneNode = {
    id: `node-${crypto.randomUUID()}`,
    name: `${type.toUpperCase()}设备`,
    type,
    position: { x: (Math.random() - 0.5) * 8, y: 0, z: (Math.random() - 0.5) * 8 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 1, z: 1 },
    props: {}
  }

  sceneNodes.value.push(node)
  selectedId.value = node.id
  
  const mesh = createProceduralMesh(type, node.id)
  mesh.position.set(node.position.x, node.position.y, node.position.z)
  scene.add(mesh)
  modelGroupMap.set(node.id, mesh)
  
  ElMessage.success(`添加了 ${type} 模型`)
}

// Delete equipment
function deleteSelectedNode() {
  if (!selectedId.value) return
  const id = selectedId.value
  
  const mesh = modelGroupMap.get(id)
  if (mesh) {
    scene.remove(mesh)
    modelGroupMap.delete(id)
  }

  sceneNodes.value = sceneNodes.value.filter(n => n.id !== id)
  selectedId.value = null
  ElMessage.success('已删除该设备')
}

// Watch for coordinate adjustments and translate to Three.js models
watch(
  () => sceneNodes.value,
  (newNodes) => {
    newNodes.forEach((node) => {
      const mesh = modelGroupMap.get(node.id)
      if (mesh) {
        mesh.position.set(node.position.x, node.position.y, node.position.z)
        mesh.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z)
        mesh.scale.set(node.scale.x, node.scale.y, node.scale.z)
      }
    })
  },
  { deep: true }
)

// Highlight selected group
watch(selectedId, (newId, oldId) => {
  if (oldId) {
    const oldMesh = modelGroupMap.get(oldId)
    oldMesh?.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.emissiveIntensity = 0
      }
    })
  }

  if (newId) {
    const newMesh = modelGroupMap.get(newId)
    newMesh?.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material.emissive = new THREE.Color(0x06b6d4)
        child.material.emissiveIntensity = 0.2
      }
    })
  }
})

async function fetchDatasetOptions() {
  try {
    const res: any = await request.get('/api/datasets')
    datasetOptions.value = res.items || []
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

// Fetch columns when selectedNode changes
watch(
  () => selectedNode.value?.props.datasetId,
  async (newDsId) => {
    datasetColumns.value = []
    if (newDsId) {
      try {
        const res: any = await request.get(`/api/datasets/${newDsId}/preview`)
        datasetColumns.value = res.columns || []
      } catch (err) {
        console.error(err)
      }
    }
  }
)

async function loadScene() {
  try {
    const res: any = await request.get(`/api/sceneProjects/${projectId}`)
    projectDetail.value = res.item
    sceneTitle.value = res.item.name
    sceneNodes.value = typeof res.item.sceneNodes === 'string' ? JSON.parse(res.item.sceneNodes) : (res.item.sceneNodes || [])

    // Clear old meshes
    modelGroupMap.forEach((mesh) => scene.remove(mesh))
    modelGroupMap.clear()

    // Add meshes from database
    sceneNodes.value.forEach((node) => {
      const mesh = createProceduralMesh(node.type, node.id)
      mesh.position.set(node.position.x, node.position.y, node.position.z)
      mesh.rotation.set(node.rotation.x, node.rotation.y, node.rotation.z)
      mesh.scale.set(node.scale.x, node.scale.y, node.scale.z)
      scene.add(mesh)
      modelGroupMap.set(node.id, mesh)
    })
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
      status: 'editing'
    })
    ElMessage.success('保存成功')
    await loadScene()
  } catch (err) {
    console.error('保存失败:', err)
  } finally {
    saving.value = false
  }
}

function handlePreview() {
  router.push(`/scenes/${projectId}/preview`)
}

function backToList() {
  router.push('/scenes')
}

// Initialize Three.js viewport
let animationFrameId: number

function initThree() {
  if (!canvasContainer.value) return

  const width = canvasContainer.value.clientWidth
  const height = canvasContainer.value.clientHeight

  scene = new THREE.Scene()
  // Add dark slate mist for premium look
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
  controls.maxPolarAngle = Math.PI / 2 - 0.05 // Don't allow camera to go below ground

  // Dark Grid Floor
  const gridHelper = new THREE.GridHelper(50, 50, 0x0891b2, 0x1e293b)
  scene.add(gridHelper)

  // Soft Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.35)
  scene.add(ambientLight)

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.75)
  dirLight.position.set(15, 25, 10)
  scene.add(dirLight)

  const pointLight = new THREE.PointLight(0x06b6d4, 1, 20)
  pointLight.position.set(0, 5, 0)
  scene.add(pointLight)

  setupInteraction()

  function animate() {
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
  await fetchDatasetOptions()
  await loadScene()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cancelAnimationFrame(animationFrameId)
  renderer?.dispose()
})
</script>

<style scoped>
.dark-input :deep(.el-input__wrapper) {
  background-color: rgba(15, 23, 42, 0.6) !important;
  border-color: rgba(51, 65, 85, 0.8) !important;
  box-shadow: none !important;
}
.dark-input :deep(.el-input__inner) {
  color: #e2e8f0 !important;
}
</style>
