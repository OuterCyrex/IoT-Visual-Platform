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
        <el-button>预览</el-button>
        <el-button>保存</el-button>
        <el-button type="primary">发布</el-button>
      </div>
    </header>

    <div class="grid h-[calc(100vh-4rem)] min-h-0 grid-cols-[280px_1fr_300px]">
      <aside class="border-r border-slate-200 bg-white p-4">
        <div class="mb-4">
          <div class="text-sm font-medium text-slate-900">基础组件</div>
          <div class="mt-1 text-xs text-slate-500">拖拽到中间画布</div>
        </div>

        <div
          v-for="item in palette"
          :key="item.component"
          class="mb-3 flex cursor-grab items-center gap-3 rounded-lg border border-slate-200 px-3 py-3"
          draggable="true"
          @dragstart="onPaletteDragStart($event, item)"
          @dragend="onPaletteDragEnd"
        >
          <span class="h-3 w-3 rounded-full" :class="item.dotClass"></span>
          <div>
            <div class="text-sm font-medium">{{ item.label }}</div>
            <div class="text-xs text-slate-500">{{ item.desc }}</div>
          </div>
        </div>
      </aside>

      <main class="flex min-w-0 min-h-0 flex-col bg-slate-100 p-4">
        <div class="mb-3 flex items-center justify-between">
          <div class="text-sm text-slate-500">画布</div>
          <div class="text-xs text-slate-400">支持拖拽、缩放、选中</div>
        </div>

        <div
          ref="canvasRef"
          class="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          @dragover.prevent
          @drop="onCanvasDrop"
          @pointerdown.self="selectedId = null"
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
                :is="componentMap[node.component]"
                v-bind="node.props"
                @click.stop="selectedId = node.id"
              />
              </div>
            </vue-draggable-resizable>
          </div>
        </div>
      </main>

      <aside class="border-l border-slate-200 bg-white p-4">
        <div class="mb-4">
          <div class="text-sm font-medium text-slate-900">属性面板</div>
          <div class="mt-1 text-xs text-slate-500">选中元素后编辑</div>
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
            <el-button class="w-full" type="danger" plain @click="removeSelected">
              删除元素
            </el-button>
          </el-form>
        </template>

        <el-empty v-else description="请选择画布上的元素" />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import VueDraggableResizable from 'vue-draggable-resizable'
import 'vue-draggable-resizable/style.css'
import { PaletteList, type PaletteItem } from '../../types/palette-item'
import type { ScreenNode } from '../../types/screen-node'
import WidgetRect from '../../components/screen-widgets/WidgetRect.vue'
import WidgetCircle from '../../components/screen-widgets/WidgetCircle.vue'
import WidgetChart from '../../components/screen-widgets/WidgetChart.vue'
import WidgetText from '../../components/screen-widgets/WidgetText.vue'

const router = useRouter()
const route = useRoute()
const canvasRef = ref<HTMLElement | null>(null)
const stageRef = ref<HTMLElement | null>(null)
const selectedId = ref<string | null>(null)

const screenTitle = computed(() => {
  const id = String(route.params.id ?? 'unknown')
  return `大屏项目 ${id}`
})

const palette = PaletteList

const componentMap: Record<PaletteItem['component'], unknown> = {
  rect: WidgetRect,
  circle: WidgetCircle,
  chart: WidgetChart,
  text: WidgetText,
}

const nodes = ref<ScreenNode[]>([])
const selectedNode = computed(() => nodes.value.find((node) => node.id === selectedId.value) ?? null)

function backToList() {
  router.push({ name: 'screens' })
}

function onPaletteDragStart(e: DragEvent, item: PaletteItem) {
  e.dataTransfer?.setData('application/json', JSON.stringify(item))
}

function onPaletteDragEnd() {}

function updatePos(id: string, x: number, y: number) {
  const n = nodes.value.find((node) => node.id === id)
  if (!n) return
  n.x = x
  n.y = y
}

function updateSize(id: string, x: number, y: number, w: number, h: number) {
  const n = nodes.value.find((node) => node.id === id)
  if (!n) return
  n.x = x
  n.y = y
  n.w = w
  n.h = h
}

function createNode(template: PaletteItem, x: number, y: number): ScreenNode {
  return {
    id: crypto.randomUUID(),
    component: template.component,
    x,
    y,
    w: template.defaultSize.w,
    h: template.defaultSize.h,
    props: structuredClone(template.defaultProps),
  }
}

function onCanvasDrop(e: DragEvent) {
  const raw = e.dataTransfer?.getData('application/json')
  if (!raw || !stageRef.value) return

  const template: PaletteItem = JSON.parse(raw)
  const rect = stageRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  nodes.value.push(createNode(template, x, y))
}

function removeSelected() {
  if (!selectedId.value) return
  nodes.value = nodes.value.filter((node) => node.id !== selectedId.value)
  selectedId.value = null
}
</script>
