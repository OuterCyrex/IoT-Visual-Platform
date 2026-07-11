<template>
  <div
    class="relative h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col items-center justify-center">
    <!-- Top Floating Toolbar -->
    <div
      class="absolute top-4 left-4 z-50 flex items-center gap-3 rounded-lg bg-slate-900/90 px-4 py-2 backdrop-blur border border-slate-800 shadow-xl">
      <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
      <div class="text-sm font-semibold tracking-wide text-slate-200">{{ screenTitle }}</div>
      <el-tag size="small" type="info" effect="dark" class="border-slate-700 bg-slate-800">{{ publishedVersion
      }}</el-tag>
      <el-button size="small" type="info" plain class="ml-2 hover:bg-slate-800 border-slate-700"
        @click="backToEditor">返回编辑</el-button>
    </div>

    <!-- Canvas Wrapper with Scale to Fit (1920x1080 resolution simulation) -->
    <div class="relative bg-slate-900 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded overflow-hidden"
      :style="canvasStyle">
      <!-- Grid lines to make it look premium -->
      <div
        class="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-10">
      </div>

      <!-- Render Nodes -->
      <div v-for="node in nodes" :key="node.id" class="absolute select-none overflow-hidden transition-all duration-300"
        :style="{
          left: `${node.x}px`,
          top: `${node.y}px`,
          width: `${node.w}px`,
          height: `${node.h}px`
        }">

        <component :is="screenComponentMap[node.component as keyof typeof screenComponentMap]" v-bind="buildComponentProps(node)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import request from '../../utils/request'
import type { ScreenNode } from '../../types/screen-node'
import { screenComponentMap } from '../../components/screen-widgets/config'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const screenTitle = ref('大屏画布')
const publishedVersion = ref('未发布')
const nodes = ref<ScreenNode[]>([])

// Reactive database dataset rows storage
const datasetData = ref<Record<string, { columns: string[], rows: any[] }>>({})
const timers: any[] = []

// Auto-scaling logic to fit screen
const scale = ref(1)
const canvasWidth = 1920
const canvasHeight = 1080

const canvasStyle = computed(() => ({
  width: `${canvasWidth}px`,
  height: `${canvasHeight}px`,
  transform: `scale(${scale.value})`,
  transformOrigin: 'center center',
}))

function buildComponentProps(node: ScreenNode) {
  return {
    ...node.props,
    ...(['chart', 'lineChart', 'pieChart', 'metricCard', 'progressBar', 'rankingList', 'alertList'].includes(node.component)
      ? {
          rows: node.props.datasetId ? datasetData.value[node.props.datasetId]?.rows || [] : [],
        }
      : {}),
  }
}

function handleResize() {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const scaleX = (windowWidth * 0.95) / canvasWidth
  const scaleY = (windowHeight * 0.90) / canvasHeight
  scale.value = Math.min(scaleX, scaleY, 1)
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
  const datasetIds = [...new Set(nodes.value.map(n => n.props.datasetId).filter(Boolean))] as string[]
  await Promise.all(datasetIds.map(id => fetchDatasetData(id)))
}

function setupRefreshTimers() {
  timers.forEach(t => clearInterval(t))
  timers.length = 0

  nodes.value.forEach(node => {
    const interval = Number(node.props.refreshInterval || 0)
    const dsId = node.props.datasetId
    if (dsId && interval > 0) {
      const timer = setInterval(() => {
        fetchDatasetData(dsId)
      }, interval)
      timers.push(timer)
    }
  })
}

function getDisplayText(node: ScreenNode) {
  const dsId = node.props.datasetId
  const field = node.props.yField
  if (dsId && field && datasetData.value[dsId]) {
    const val = datasetData.value[dsId].rows?.[0]?.[field]
    return val !== undefined ? String(val) : '无数据'
  }
  return node.props.text || '文本区域'
}

async function loadProject() {
  try {
    const res: any = await request.get(`/api/screenProjects/${projectId}`)
    const item = res.item
    if (item) {
      screenTitle.value = item.name
      publishedVersion.value = item.publishedVersion || '未发布'
      nodes.value = typeof item.screenNodes === 'string' ? JSON.parse(item.screenNodes) : (item.screenNodes || [])

      await fetchAllDatasetData()
      setupRefreshTimers()
    }
  } catch (err) {
    console.error(err)
  }
}

function backToEditor() {
  router.push(`/screens/${projectId}/editor`)
}

onMounted(() => {
  loadProject()
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  timers.forEach(t => clearInterval(t))
})
</script>

<style scoped>
:deep(body) {
  margin: 0;
  padding: 0;
}
</style>
