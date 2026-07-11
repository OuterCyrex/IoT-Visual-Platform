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
          <div class="text-sm text-slate-500">画布</div>
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <span>支持拖拽、平移、缩放节点</span>
          </div>
        </div>

        <div
          ref="canvasRef"
          class="relative min-h-0 flex-1 cursor-grab overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm select-none"
          :class="{ 'cursor-grabbing': isPanning }"
          @dragover.prevent
          @drop="onCanvasDrop"
          @pointerdown="onCanvasPointerDown"
          @pointermove="onCanvasPointerMove"
          @pointerup="endCanvasPan"
          @pointercancel="endCanvasPan"
        >
          <div ref="stageRef" class="screen-stage">
            <div class="screen-stage-grid"></div>

            <vue-draggable-resizable
              v-for="node in nodes"
              :key="node.id"
              :x="node.x"
              :y="node.y"
              :w="node.w"
              :h="node.h"
              :parent="false"
              @dragging="(x: number, y: number) => updatePos(node.id, x, y)"
              @resizing="(x: number, y: number, w: number, h: number) => updateSize(node.id, x, y, w, h)"
            >
              <div class="screen-node" :class="[node.component, { selected: selectedId === node.id }]">
                <component
                  :is="screenComponentMap[node.component as keyof typeof screenComponentMap]"
                  v-bind="node.props"
                  @click.stop="selectedId = node.id"
                />
              </div>
            </vue-draggable-resizable>
          </div>
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
import {
  createScreenNode,
  DUAL_FIELD_COMPONENTS,
  LABEL_FIELD_COMPONENTS,
  SINGLE_VALUE_COMPONENTS,
} from '../../utils/screen-node'

const router = useRouter()
const route = useRoute()
const projectId = String(route.params.id)

const canvasRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const selectedId = ref<string | null>(null)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })

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

function onCanvasPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('.vdr')) return
  if (!canvasRef.value) return

  isPanning.value = true
  panStart.value = {
    x: event.clientX,
    y: event.clientY,
    scrollLeft: canvasRef.value.scrollLeft,
    scrollTop: canvasRef.value.scrollTop,
  }
  canvasRef.value.setPointerCapture(event.pointerId)
  selectedId.value = null
}

function onCanvasPointerMove(event: PointerEvent) {
  if (!isPanning.value || !canvasRef.value) return

  const dx = event.clientX - panStart.value.x
  const dy = event.clientY - panStart.value.y
  canvasRef.value.scrollLeft = panStart.value.scrollLeft - dx
  canvasRef.value.scrollTop = panStart.value.scrollTop - dy
}

function endCanvasPan(event?: PointerEvent) {
  if (canvasRef.value && event) {
    try {
      canvasRef.value.releasePointerCapture(event.pointerId)
    } catch {
      // Ignore if capture already ended.
    }
  }
  isPanning.value = false
}

function updatePos(id: string, x: number, y: number) {
  const node = nodes.value.find((item) => item.id === id)
  if (!node) return
  node.x = x
  node.y = y
}

function updateSize(id: string, x: number, y: number, w: number, h: number) {
  const node = nodes.value.find((item) => item.id === id)
  if (!node) return
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

function removeSelected() {
  if (!selectedId.value) return
  nodes.value = nodes.value.filter((node) => node.id !== selectedId.value)
  selectedId.value = null
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

onMounted(() => {
  loadProject()
  loadDatasetOptions()
  window.addEventListener('pointerup', endCanvasPan as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('pointerup', endCanvasPan as EventListener)
})
</script>
