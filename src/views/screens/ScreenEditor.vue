<template>
  <div class="h-screen w-screen overflow-hidden bg-slate-50 text-slate-800">
    <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
      <div class="flex items-center gap-4">
        <el-button text @click="backToList">返回列表</el-button>
        <div>
          <div class="text-sm text-slate-500">大屏编辑</div>
          <div class="text-base font-semibold text-slate-900">{{ screenTitle }}</div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <el-button @click="handlePreview">预览</el-button>
        <el-button :loading="saving" @click="handleSave">保存</el-button>
        <el-button type="primary" :loading="publishing" @click="handlePublish">发布</el-button>
      </div>
    </header>

    <div class="grid h-[calc(100vh-4rem)] min-h-0 grid-cols-[280px_1fr_300px]">
      <aside class="border-r border-slate-200 bg-white p-4 overflow-y-auto">
        <el-collapse v-model="sidebarActiveNames">
          <el-collapse-item
            v-for="group in PaletteList"
            :key="group.label"
            :title="group.label"
            :name="group.label"
          >
            <div class="pt-3">
              <div
                v-for="item in group.items"
                :key="item.component"
                class="mb-2 cursor-grab rounded-lg border border-slate-200 px-3 py-2 transition hover:border-sky-300 hover:bg-sky-50"
                draggable="true"
                @dragstart="onPaletteDragStart($event, item)"
                @dragend="onPaletteDragEnd"
              >
                <div class="text-sm font-medium text-slate-800">{{ item.label }}</div>
                <div class="text-xs text-slate-500">{{ item.desc }}</div>
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </aside>

      <main class="flex min-h-0 min-w-0 flex-col bg-slate-100 p-4">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-500">画布</span>
            <el-radio-group v-model="editMode" size="small">
              <el-radio-button value="select">🖱️ 框选模式</el-radio-button>
              <el-radio-button value="pan">🖐️ 拖拽平移</el-radio-button>
              <el-radio-button value="draw_pipe">✏️ 绘制管道</el-radio-button>
            </el-radio-group>
            
            <div v-if="selectedIds.length > 0" class="flex items-center gap-2 border-l border-slate-300 pl-3">
              <span class="text-xs font-semibold text-slate-600">已选中 {{ selectedIds.length }} 个组件</span>
              <el-button-group size="small">
                <el-button type="info" plain @click="duplicateSelectedNodes">📋 复制组件</el-button>
                <el-button type="warning" plain @click="lockSelectedNodes">🔒 锁定位置</el-button>
                <el-button type="success" plain @click="unlockSelectedNodes">🔓 解锁位置</el-button>
                <el-button type="primary" plain @click="groupSelectedNodes">🔗 组合绑定</el-button>
                <el-button type="danger" plain @click="ungroupSelectedNodes">🔌 取消组合</el-button>
              </el-button-group>
              
              <el-button-group size="small" class="ml-2">
                <el-button type="default" plain @click="scaleSelectedNodes(1.1)">➕ 整体放大</el-button>
                <el-button type="default" plain @click="scaleSelectedNodes(0.9)">➖ 整体缩小</el-button>
              </el-button-group>
            </div>
          </div>
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span>{{ editMode === 'select' ? '支持在空白处按住左键拖拽进行框选，支持 Shift+点击 多选' : editMode === 'draw_pipe' ? '在画布按住左键并拖拽，即可直接绘制两点间的流光连接管道' : '支持按住左键拖拽平移画布' }}</span>
          </div>
        </div>

        <div
          ref="canvasRef"
          class="relative min-h-0 flex-1 overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm select-none"
          :class="[editMode === 'pan' ? 'cursor-grab' : 'cursor-default', { 'cursor-grabbing': isPanning }]"
          @dragover.prevent
          @drop="onCanvasDrop"
          @pointerdown="onCanvasPointerDown"
          @pointermove="onCanvasPointerMove"
          @pointerup="endCanvasPan"
          @pointercancel="endCanvasPan"
        >
          <div ref="stageRef" class="screen-stage" :style="stageStyle">
            <div class="screen-stage-grid"></div>

            <vue-draggable-resizable
              v-for="node in nodes"
              :key="node.id"
              :data-node-id="node.id"
              :x="node.x"
              :y="node.y"
              :w="node.w"
              :h="node.h"
              :parent="false"
              :draggable="!node.locked"
              :resizable="!node.locked"
              @dragging="(x: number, y: number) => updatePos(node.id, x, y)"
              @resizing="(x: number, y: number, w: number, h: number) => updateSize(node.id, x, y, w, h)"
            >
              <div
                class="screen-node"
                :class="[
                  node.component,
                  {
                    selected: selectedIds.includes(node.id) || selectedId === node.id,
                    locked: node.locked
                  }
                ]"
                :style="{ transform: node.rotate ? `rotate(${node.rotate}deg)` : undefined }"
                @click.stop="onNodeClick(node.id, $event)"
              >
                <component
                  :is="screenComponentMap[node.component as keyof typeof screenComponentMap]"
                  v-bind="buildComponentProps(node)"
                />
                
                <!-- Lock Indicator -->
                <div v-if="node.locked" class="absolute top-1 right-1 flex items-center justify-center bg-amber-500 text-white rounded px-1 py-0.5 text-[9px] pointer-events-none z-10 font-bold shadow-sm">
                  🔒 锁定
                </div>
                <!-- Group Indicator -->
                <div v-if="node.groupId" class="absolute top-1 left-1 flex items-center justify-center bg-blue-500 text-white rounded px-1 py-0.5 text-[9px] pointer-events-none z-10 font-bold shadow-sm">
                  🔗 组合
                </div>
              </div>
            </vue-draggable-resizable>

            <!-- Pipe Drawing Preview SVG -->
            <svg
              v-if="isDrawingPipe"
              class="absolute inset-0 pointer-events-none z-[10000]"
              width="100%"
              height="100%"
            >
              <line
                :x1="pipeStart.x"
                :y1="pipeStart.y"
                :x2="pipeEnd.x"
                :y2="pipeEnd.y"
                stroke="#00f3ff"
                stroke-width="4"
                stroke-dasharray="5 5"
                opacity="0.8"
              />
              <circle :cx="pipeStart.x" :cy="pipeStart.y" r="4" fill="#00f3ff" />
              <circle :cx="pipeEnd.x" :cy="pipeEnd.y" r="4" fill="#00f3ff" />
            </svg>
          </div>

          <!-- Selection Rectangle Overlay -->
          <div
            v-if="isSelecting && selectionRectStyle"
            class="absolute border-2 border-sky-500 bg-sky-500/10 pointer-events-none z-[9999]"
            :style="selectionRectStyle"
          ></div>
        </div>
      </main>

      <aside class="border-l border-slate-200 bg-white p-4 overflow-y-auto">
        <div class="mb-4">
          <div class="text-sm font-medium text-slate-900">属性面板</div>
          <div class="mt-1 text-xs text-slate-500">选中画布元素后编辑其属性与数据绑定</div>
        </div>

        <template v-if="selectedNode">
          <el-form label-position="top">
            <el-form-item label="名称">
              <el-input v-model="selectedNode.props.text" />
            </el-form-item>

            <!-- Custom topology device settings -->
            <template v-if="selectedNode.component === 'topologyDevice'">
              <el-form-item label="设备类型">
                <el-select v-model="selectedNode.props.deviceType" placeholder="选择设备类型" class="w-full">
                  <el-option label="变压器" value="transformer" />
                  <el-option label="储能电池" value="battery" />
                  <el-option label="配电柜" value="cabinet" />
                  <el-option label="UPS 电源" value="ups" />
                  <el-option label="服务器机柜" value="rack" />
                  <el-option label="空调冷机" value="chiller" />
                  <el-option label="柴油发电机" value="generator" />
                </el-select>
              </el-form-item>

              <el-form-item label="静态状态 (无数据绑定时)">
                <el-select v-model="selectedNode.props.status" placeholder="选择初始状态" class="w-full">
                  <el-option label="正常运行 (running)" value="running" />
                  <el-option label="告警中 (warning)" value="warning" />
                  <el-option label="已停机 (stopped)" value="stopped" />
                </el-select>
              </el-form-item>
            </template>

            <!-- Custom 2.5D mine device settings -->
            <template v-if="selectedNode.component === 'mineDevice'">
              <el-form-item label="设备类型">
                <el-select v-model="selectedNode.props.deviceType" placeholder="选择设备类型" class="w-full">
                  <el-option label="主/副竖井塔" value="shaft" />
                  <el-option label="重型板式给料机" value="feeder_plate" />
                  <el-option label="金属原煤仓" value="silo_metal" />
                  <el-option label="混凝土配煤仓" value="silo_concrete" />
                  <el-option label="重型破碎机" value="crusher_jaw" />
                  <el-option label="高频振动筛" value="sifter_vibratory" />
                  <el-option label="标准皮带机" value="conveyor_belt" />
                  <el-option label="长型皮带机" value="conveyor_belt_long" />
                  <el-option label="宽型重载皮带机" value="conveyor_belt_wide" />
                  <el-option label="电磁除铁器" value="iron_remover" />
                  <el-option label="袋式除尘器" value="baghouse_filter" />
                  <el-option label="点式除尘箱" value="dust_collector" />
                  <el-option label="流光连接管道" value="pipeline" />
                </el-select>
              </el-form-item>

              <el-form-item label="方向配置">
                <div class="flex gap-4">
                  <el-checkbox v-model="selectedNode.props.flipX">水平翻转 (左右)</el-checkbox>
                  <el-checkbox v-model="selectedNode.props.flipY">垂直翻转 (上下)</el-checkbox>
                </div>
              </el-form-item>

              <el-form-item label="外观配置">
                <el-checkbox v-model="selectedNode.props.transparentBg">透明背景 (无边框和背板)</el-checkbox>
              </el-form-item>

              <template v-if="selectedNode.props.deviceType === 'pipeline'">
                <el-form-item label="管道形状">
                  <el-select v-model="selectedNode.props.pipeShape" placeholder="选择管道走向" class="w-full">
                    <el-option label="斜向右上" value="slope_up" />
                    <el-option label="斜向右下" value="slope_down" />
                    <el-option label="水平管道" value="horizontal" />
                    <el-option label="垂直管道" value="vertical" />
                    <el-option label="L型折角管道" value="elbow_l" />
                  </el-select>
                </el-form-item>

                <el-form-item label="物料流速颜色">
                  <el-select v-model="selectedNode.props.pipeColor" placeholder="选择物料颜色" class="w-full">
                    <el-option label="冰蓝色 (水/泥浆)" value="cyan" />
                    <el-option label="翡翠绿 (空气/瓦斯)" value="green" />
                    <el-option label="矿砂金 (原矿/煤炭)" value="gold" />
                    <el-option label="警示红 (高危介质)" value="red" />
                  </el-select>
                </el-form-item>

                <el-form-item label="管道线条样式">
                  <el-select v-model="selectedNode.props.pipeStyle" placeholder="选择线条类型" class="w-full">
                    <el-option label="实线 (持续流)" value="solid" />
                    <el-option label="虚线 (脉冲流)" value="dashed" />
                  </el-select>
                </el-form-item>
              </template>

              <el-form-item label="静态状态 (无数据绑定时)">
                <el-select v-model="selectedNode.props.status" placeholder="选择初始状态" class="w-full">
                  <el-option label="正常运行 (running)" value="running" />
                  <el-option label="告警中 (warning)" value="warning" />
                  <el-option label="已停机 (stopped)" value="stopped" />
                </el-select>
              </el-form-item>
            </template>

            <!-- Custom 2.5D solar PV device settings -->
            <template v-if="selectedNode.component === 'pvDevice'">
              <el-form-item label="设备类型">
                <el-select v-model="selectedNode.props.deviceType" placeholder="选择设备类型" class="w-full">
                  <el-option label="太阳能电板" value="pv_panel" />
                  <el-option label="光伏汇流箱" value="combiner_box" />
                  <el-option label="智能逆变器" value="inverter" />
                  <el-option label="箱式变压器" value="box_transformer" />
                  <el-option label="并网高压电塔" value="transmission_tower" />
                </el-select>
              </el-form-item>

              <el-form-item label="方向配置">
                <div class="flex gap-4">
                  <el-checkbox v-model="selectedNode.props.flipX">水平翻转 (左右)</el-checkbox>
                  <el-checkbox v-model="selectedNode.props.flipY">垂直翻转 (上下)</el-checkbox>
                </div>
              </el-form-item>

              <el-form-item label="外观配置">
                <el-checkbox v-model="selectedNode.props.transparentBg">透明背景 (无边框和背板)</el-checkbox>
              </el-form-item>

              <el-form-item label="静态状态 (无数据绑定时)">
                <el-select v-model="selectedNode.props.status" placeholder="选择初始状态" class="w-full">
                  <el-option label="正常运行 (running)" value="running" />
                  <el-option label="告警中 (warning)" value="warning" />
                  <el-option label="已停机 (stopped)" value="stopped" />
                </el-select>
              </el-form-item>
            </template>

            <div class="grid grid-cols-2 gap-3">
              <el-form-item label="宽度">
                <el-input-number v-model="selectedNode.w" :min="20" class="w-full" />
              </el-form-item>
              <el-form-item label="高度">
                <el-input-number v-model="selectedNode.h" :min="20" class="w-full" />
              </el-form-item>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <el-form-item label="X">
                <el-input-number v-model="selectedNode.x" :min="0" class="w-full" />
              </el-form-item>
              <el-form-item label="Y">
                <el-input-number v-model="selectedNode.y" :min="0" class="w-full" />
              </el-form-item>
            </div>

            <el-form-item label="旋转角度 (°)">
              <el-slider v-model="selectedNode.rotate" :min="0" :max="360" :step="15" show-input />
            </el-form-item>

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
              <template v-if="dualFieldComponents.includes(selectedNode.component)">
                <el-form-item label="维度字段">
                  <el-select v-model="selectedNode.props.xField" placeholder="选择分类字段" class="w-full">
                    <el-option v-for="col in datasetColumns" :key="col" :label="col" :value="col" />
                  </el-select>
                </el-form-item>

                <el-form-item label="指标字段">
                  <el-select v-model="selectedNode.props.yField" placeholder="选择数值字段" class="w-full">
                    <el-option v-for="col in datasetColumns" :key="col" :label="col" :value="col" />
                  </el-select>
                </el-form-item>
              </template>

              <template v-else-if="singleValueComponents.includes(selectedNode.component)">
                <el-form-item label="数值字段">
                  <el-select v-model="selectedNode.props.yField" placeholder="选择展示字段" class="w-full">
                    <el-option v-for="col in datasetColumns" :key="col" :label="col" :value="col" />
                  </el-select>
                </el-form-item>
              </template>

              <template v-if="labelFieldComponents.includes(selectedNode.component)">
                <el-form-item label="标签字段">
                  <el-select
                    v-model="selectedNode.props.xField"
                    placeholder="可选：用于副标题或标签"
                    clearable
                    class="w-full"
                  >
                    <el-option v-for="col in datasetColumns" :key="col" :label="col" :value="col" />
                  </el-select>
                </el-form-item>
              </template>

              <el-form-item label="自动刷新策略">
                <el-select v-model="selectedNode.props.refreshInterval" class="w-full">
                  <el-option label="手动刷新" :value="0" />
                  <el-option label="每 5 秒" :value="5000" />
                  <el-option label="每 10 秒" :value="10000" />
                  <el-option label="每 30 秒" :value="30000" />
                </el-select>
              </el-form-item>
            </template>

            <el-button class="mt-4 w-full" type="danger" plain @click="removeSelected">
              删除元素
            </el-button>
          </el-form>
        </template>

        <el-empty v-else description="请选择画布中的元素" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/style.css'
import { ElMessage, ElMessageBox } from 'element-plus'
import { PaletteList, type PaletteItem } from '../../types/palette-item'
import { screenComponentMap } from '../../components/screen-widgets/config'
import { useScreenDatasetBinding } from '../../composables/screens/useScreenDatasetBinding'
import { useScreenProject } from '../../composables/screens/useScreenProject'
import { useScreenPreviewData } from '../../composables/screens/useScreenPreviewData'
import type { ScreenNode } from '../../types/screen-node'
import {
  createScreenNode,
  DUAL_FIELD_COMPONENTS,
  LABEL_FIELD_COMPONENTS,
  SINGLE_VALUE_COMPONENTS,
  getNodeDatasetId,
  supportsDatasetRows
} from '../../utils/screen-node'

const router = useRouter()
const route = useRoute()
const projectId = String(route.params.id)

const canvasRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const selectedId = ref<string | null>(null)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })

// Multi-select, Lock/Group & Drawing States
const editMode = ref<'select' | 'pan' | 'draw_pipe'>('select')
const selectedIds = ref<string[]>([])
const isSelecting = ref(false)
const selectionStart = ref({ x: 0, y: 0 })
const selectionEnd = ref({ x: 0, y: 0 })

const isDrawingPipe = ref(false)
const pipeStart = ref({ x: 0, y: 0 })
const pipeEnd = ref({ x: 0, y: 0 })

const selectionRectStyle = computed(() => {
  if (!isSelecting.value || !canvasRef.value) return null
  const canvasRect = canvasRef.value.getBoundingClientRect()
  const startX = selectionStart.value.x - canvasRect.left + canvasRef.value.scrollLeft
  const startY = selectionStart.value.y - canvasRect.top + canvasRef.value.scrollTop
  const endX = selectionEnd.value.x - canvasRect.left + canvasRef.value.scrollLeft
  const endY = selectionEnd.value.y - canvasRect.top + canvasRef.value.scrollTop
  
  return {
    left: Math.min(startX, endX) + 'px',
    top: Math.min(startY, endY) + 'px',
    width: Math.abs(endX - startX) + 'px',
    height: Math.abs(endY - startY) + 'px'
  }
})

const { projectDetail, nodes, loadProject, saveProject, publishProject } = useScreenProject(projectId)
const {
  datasetOptions,
  datasetColumns,
  loadDatasetOptions,
  changeNodeDataset,
  syncColumnsForNode,
} = useScreenDatasetBinding()
const saving = ref(false)
const publishing = ref(false)

const { datasetData, fetchDatasetData } = useScreenPreviewData()

const stageStyle = computed(() => {
  const isMining = projectId === 'scr-005'
  return {
    width: isMining ? '2560px' : '1920px',
    height: isMining ? '1440px' : '1080px'
  }
})

function buildComponentProps(node: ScreenNode) {
  const datasetId = getNodeDatasetId(node)
  return {
    ...node.props,
    ...(supportsDatasetRows(node.component)
      ? {
          rows: datasetId ? datasetData.value[datasetId]?.rows || [] : [],
        }
      : {}),
  }
}

const sidebarActiveNames = ref<string[]>(PaletteList.map((group) => group.label))

const dualFieldComponents: readonly string[] = DUAL_FIELD_COMPONENTS
const singleValueComponents: readonly string[] = SINGLE_VALUE_COMPONENTS
const labelFieldComponents: readonly string[] = LABEL_FIELD_COMPONENTS

const screenTitle = computed(() => projectDetail.value?.name || `加载中... (${projectId})`)
const selectedNode = computed(() => nodes.value.find((node) => node.id === selectedId.value) ?? null)

function backToList() {
  router.push({ name: 'screens' })
}

function onPaletteDragStart(event: DragEvent, item: PaletteItem) {
  event.dataTransfer?.setData('application/json', JSON.stringify(item))
}

function onPaletteDragEnd() {}

function onNodeClick(nodeId: string, event: MouseEvent) {
  if (event.shiftKey) {
    if (selectedIds.value.includes(nodeId)) {
      selectedIds.value = selectedIds.value.filter(id => id !== nodeId)
    } else {
      selectedIds.value.push(nodeId)
    }
    selectedId.value = selectedIds.value[0] || null
  } else {
    selectedIds.value = [nodeId]
    selectedId.value = nodeId
  }
}

function onCanvasPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('.vdr')) return
  if (!canvasRef.value) return

  if (editMode.value === 'pan') {
    isPanning.value = true
    panStart.value = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: canvasRef.value.scrollLeft,
      scrollTop: canvasRef.value.scrollTop,
    }
    canvasRef.value.setPointerCapture(event.pointerId)
    selectedId.value = null
    selectedIds.value = []
  } else if (editMode.value === 'draw_pipe') {
    if (!stageRef.value) return
    const rect = stageRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    isDrawingPipe.value = true
    pipeStart.value = { x, y }
    pipeEnd.value = { x, y }
    canvasRef.value.setPointerCapture(event.pointerId)
  } else {
    isSelecting.value = true
    selectionStart.value = { x: event.clientX, y: event.clientY }
    selectionEnd.value = { x: event.clientX, y: event.clientY }
    
    if (!event.shiftKey) {
      selectedIds.value = []
      selectedId.value = null
    }
    canvasRef.value.setPointerCapture(event.pointerId)
  }
}

function onCanvasPointerMove(event: PointerEvent) {
  if (isPanning.value && editMode.value === 'pan' && canvasRef.value) {
    const dx = event.clientX - panStart.value.x
    const dy = event.clientY - panStart.value.y
    canvasRef.value.scrollLeft = panStart.value.scrollLeft - dx
    canvasRef.value.scrollTop = panStart.value.scrollTop - dy
  } else if (isSelecting.value && editMode.value === 'select') {
    selectionEnd.value = { x: event.clientX, y: event.clientY }
  } else if (isDrawingPipe.value && editMode.value === 'draw_pipe') {
    if (stageRef.value) {
      const rect = stageRef.value.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      pipeEnd.value = { x, y }
    }
  }
}

function endCanvasPan(event?: PointerEvent) {
  if (canvasRef.value && event) {
    try {
      canvasRef.value.releasePointerCapture(event.pointerId)
    } catch {
      // Ignore
    }
  }

  if (isSelecting.value && editMode.value === 'select') {
    const dist = Math.hypot(
      selectionEnd.value.x - selectionStart.value.x,
      selectionEnd.value.y - selectionStart.value.y
    )
    
    if (dist > 3) {
      const rect1 = {
        left: Math.min(selectionStart.value.x, selectionEnd.value.x),
        top: Math.min(selectionStart.value.y, selectionEnd.value.y),
        right: Math.max(selectionStart.value.x, selectionEnd.value.x),
        bottom: Math.max(selectionStart.value.y, selectionEnd.value.y)
      }
      
      const vdrElements = stageRef.value?.querySelectorAll('.vdr') || []
      const newlySelected: string[] = []
      
      vdrElements.forEach((el) => {
        const nodeId = el.getAttribute('data-node-id')
        if (!nodeId) return
        const elRect = el.getBoundingClientRect()
        const isIntersecting = !(
          rect1.right < elRect.left ||
          rect1.left > elRect.right ||
          rect1.bottom < elRect.top ||
          rect1.top > elRect.bottom
        )
        if (isIntersecting) {
          newlySelected.push(nodeId)
        }
      })
      
      if (event?.shiftKey) {
        const merged = new Set([...selectedIds.value, ...newlySelected])
        selectedIds.value = Array.from(merged)
      } else {
        selectedIds.value = newlySelected
      }
      selectedId.value = selectedIds.value[0] || null
    } else {
      if (!event?.shiftKey) {
        selectedIds.value = []
        selectedId.value = null
      }
    }
    isSelecting.value = false
  } else if (isDrawingPipe.value && editMode.value === 'draw_pipe') {
    const dx = pipeEnd.value.x - pipeStart.value.x
    const dy = pipeEnd.value.y - pipeStart.value.y
    const dist = Math.hypot(dx, dy)
    
    if (dist > 10) {
      const w = Math.abs(dx)
      const h = Math.abs(dy)
      const x = Math.min(pipeStart.value.x, pipeEnd.value.x)
      const y = Math.min(pipeStart.value.y, pipeEnd.value.y)
      
      let pipeShape: 'slope_up' | 'slope_down' | 'horizontal' | 'vertical' = 'slope_up'
      let flipX = false
      
      if (w < 15) {
        pipeShape = 'vertical'
      } else if (h < 15) {
        pipeShape = 'horizontal'
      } else {
        const isSlopeDown = (dx > 0 && dy > 0) || (dx < 0 && dy < 0)
        pipeShape = isSlopeDown ? 'slope_down' : 'slope_up'
      }
      
      if (dx < 0) {
        flipX = true
      }
      
      const newNode: ScreenNode = {
        id: 'node-' + Math.random().toString(36).substr(2, 9),
        x: Math.round(pipeShape === 'vertical' ? pipeStart.value.x - 10 : x),
        y: Math.round(pipeShape === 'horizontal' ? pipeStart.value.y - 10 : y),
        w: Math.round(pipeShape === 'vertical' ? 20 : w),
        h: Math.round(pipeShape === 'horizontal' ? 20 : h),
        component: 'mineDevice',
        props: {
          deviceType: 'pipeline',
          pipeShape,
          pipeColor: 'cyan',
          pipeStyle: 'solid',
          flipX,
          transparentBg: true
        }
      }
      nodes.value.push(newNode)
      ElMessage.success('连接流光管道绘制成功！')
    }
    isDrawingPipe.value = false
  }
  
  isPanning.value = false
}

function updatePos(id: string, x: number, y: number) {
  const node = nodes.value.find((item) => item.id === id)
  if (!node || node.locked) return

  const dx = x - node.x
  const dy = y - node.y

  if (node.groupId && (dx !== 0 || dy !== 0)) {
    nodes.value.forEach((item) => {
      if (item.groupId === node.groupId && !item.locked) {
        item.x += dx
        item.y += dy
      }
    })
  } else {
    node.x = x
    node.y = y
  }
}

function updateSize(id: string, x: number, y: number, w: number, h: number) {
  const node = nodes.value.find((item) => item.id === id)
  if (!node || node.locked) return
  node.x = x
  node.y = y
  node.w = w
  node.h = h
}

function onCanvasDrop(event: DragEvent) {
  const raw = event.dataTransfer?.getData('application/json')
  if (!raw || !stageRef.value) return

  const template: PaletteItem = JSON.parse(raw)
  const rect = stageRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  nodes.value.push(createScreenNode(template, x, y))
}

function lockSelectedNodes() {
  nodes.value.forEach((node) => {
    if (selectedIds.value.includes(node.id)) {
      node.locked = true
    }
  })
  ElMessage.success('已锁定选中组件位置')
}

function unlockSelectedNodes() {
  nodes.value.forEach((node) => {
    if (selectedIds.value.includes(node.id)) {
      node.locked = false
    }
  })
  ElMessage.success('已解锁选中组件位置')
}

function groupSelectedNodes() {
  if (selectedIds.value.length < 2) {
    ElMessage.warning('请至少选择两个组件进行组合')
    return
  }
  const groupId = 'group-' + Math.random().toString(36).substr(2, 9)
  nodes.value.forEach((node) => {
    if (selectedIds.value.includes(node.id)) {
      node.groupId = groupId
    }
  })
  ElMessage.success('组件组合绑定成功')
}

function ungroupSelectedNodes() {
  const groupIdsToClear = new Set<string>()
  nodes.value.forEach((node) => {
    if (selectedIds.value.includes(node.id) && node.groupId) {
      groupIdsToClear.add(node.groupId)
    }
  })
  
  if (groupIdsToClear.size === 0) {
    ElMessage.warning('选中组件中没有被组合的元素')
    return
  }
  
  nodes.value.forEach((node) => {
    if (node.groupId && groupIdsToClear.has(node.groupId)) {
      delete node.groupId
    }
  })
  ElMessage.success('已取消选中组件的组合绑定')
}

function duplicateSelectedNodes() {
  if (selectedIds.value.length === 0) return

  const newNodes: ScreenNode[] = []
  const oldToNewGroupIds = new Map<string, string>()

  // Map old group IDs to new ones
  selectedIds.value.forEach((id) => {
    const node = nodes.value.find((n) => n.id === id)
    if (node && node.groupId && !oldToNewGroupIds.has(node.groupId)) {
      const newGroupId = 'group-' + Math.random().toString(36).substr(2, 9)
      oldToNewGroupIds.set(node.groupId, newGroupId)
    }
  })

  const duplicatedIds: string[] = []

  selectedIds.value.forEach((id) => {
    const node = nodes.value.find((n) => n.id === id)
    if (!node) return

    const newId = 'node-' + Math.random().toString(36).substr(2, 9)
    const copiedNode: ScreenNode = {
      id: newId,
      x: node.x + 30,
      y: node.y + 30,
      w: node.w,
      h: node.h,
      component: node.component,
      locked: false,
      props: JSON.parse(JSON.stringify(node.props))
    }

    if (node.groupId) {
      copiedNode.groupId = oldToNewGroupIds.get(node.groupId)
    }

    newNodes.push(copiedNode)
    duplicatedIds.push(newId)
  })

  nodes.value.push(...newNodes)
  
  // Highlight the copied elements
  selectedIds.value = duplicatedIds
  selectedId.value = duplicatedIds[0] || null

  ElMessage.success(`已复制 ${newNodes.length} 个组件`)
}

function scaleSelectedNodes(factor: number) {
  if (selectedIds.value.length === 0) return

  const selectedNodes = nodes.value.filter((node) => selectedIds.value.includes(node.id))
  if (selectedNodes.length === 0) return

  // 1. Calculate bounding box of selection
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity

  selectedNodes.forEach((node) => {
    if (node.x < minX) minX = node.x
    if (node.x + node.w > maxX) maxX = node.x + node.w
    if (node.y < minY) minY = node.y
    if (node.y + node.h > maxY) maxY = node.y + node.h
  })

  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2

  // 2. Scale nodes relative to center
  selectedNodes.forEach((node) => {
    if (node.locked) return // Skip locked nodes

    const dx = node.x - cx
    const dy = node.y - cy

    node.w = Math.max(10, Math.round(node.w * factor))
    node.h = Math.max(10, Math.round(node.h * factor))
    node.x = Math.max(0, Math.round(cx + dx * factor))
    node.y = Math.max(0, Math.round(cy + dy * factor))
  })
}

function rotateSelectedNodes(delta: number) {
  if (selectedIds.value.length === 0) return

  nodes.value.forEach((node) => {
    if (selectedIds.value.includes(node.id)) {
      const currentRotate = node.rotate || 0
      let nextRotate = (currentRotate + delta) % 360
      if (nextRotate < 0) nextRotate += 360
      node.rotate = nextRotate
    }
  })
}

function removeSelected() {
  if (selectedIds.value.length > 0) {
    nodes.value = nodes.value.filter((node) => !selectedIds.value.includes(node.id))
    selectedIds.value = []
    selectedId.value = null
  } else if (selectedId.value) {
    nodes.value = nodes.value.filter((node) => node.id !== selectedId.value)
    selectedId.value = null
  }
}

async function handleSave() {
  if (!projectDetail.value) return

  saving.value = true
  try {
    await saveProject()
    ElMessage.success('保存成功')
  } catch (err) {
    console.error('保存失败:', err)
  } finally {
    saving.value = false
  }
}

async function handlePublish() {
  if (!projectDetail.value) return

  const currentVer = projectDetail.value.publishedVersion || '未发布'
  ElMessageBox.prompt(
    `请输入发布版本号，留空则系统自动递增。当前版本：${currentVer}`,
    '发布大屏',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '如 1.0.0 或 0.2',
    }
  )
    .then(async ({ value }) => {
      publishing.value = true
      try {
        await publishProject(value)
        ElMessage.success('发布成功')
      } catch (err) {
        console.error('发布失败:', err)
      } finally {
        publishing.value = false
      }
    })
    .catch(() => {})
}

async function handlePreview() {
  await handleSave()
  router.push(`/screens/${projectId}/preview`)
}

async function handleDatasetChange(datasetId: string) {
  try {
    await changeNodeDataset(selectedNode.value, datasetId)
    if (datasetId) {
      await fetchDatasetData(datasetId)
    }
  } catch (err) {
    console.error(err)
  }
}

watch(
  () => selectedNode.value,
  async (newNode) => {
    try {
      await syncColumnsForNode(newNode)
    } catch (err) {
      console.error(err)
    }
  },
  { immediate: true }
)

async function initializeProject() {
  try {
    await loadProject()
    // Pre-fetch all datasets that are already bound when the editor loads
    const datasetIds = [...new Set(nodes.value.map(getNodeDatasetId).filter(Boolean))]
    await Promise.all(datasetIds.map((id) => fetchDatasetData(id).catch(err => console.error(err))))
  } catch (err) {
    console.error(err)
  }
}

function handleKeyDown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
    return
  }

  // Ctrl+D to duplicate selected nodes
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
    event.preventDefault()
    duplicateSelectedNodes()
  }
  
  // Backspace or Delete to remove selected nodes
  if (event.key === 'Backspace' || event.key === 'Delete') {
    removeSelected()
  }

  // Bracket keys for sizing scaling
  if (event.key === ']') {
    scaleSelectedNodes(1.1)
  }
  if (event.key === '[') {
    scaleSelectedNodes(0.9)
  }

  // Rotation keys (R for clockwise, E for counter-clockwise)
  if (event.key.toLowerCase() === 'r') {
    rotateSelectedNodes(15)
  }
  if (event.key.toLowerCase() === 'e') {
    rotateSelectedNodes(-15)
  }
}

onMounted(() => {
  initializeProject()
  loadDatasetOptions()
  window.addEventListener('pointerup', endCanvasPan as EventListener)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('pointerup', endCanvasPan as EventListener)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>
