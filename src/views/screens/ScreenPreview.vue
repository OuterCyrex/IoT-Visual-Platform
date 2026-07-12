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
      <el-button size="small" type="info" plain class="hover:bg-slate-800 border-slate-700"
        @click="backToList">返回列表</el-button>
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
          height: `${node.h}px`,
          transform: node.rotate ? `rotate(${node.rotate}deg)` : undefined
        }">

        <component :is="screenComponentMap[node.component as keyof typeof screenComponentMap]" v-bind="buildComponentProps(node)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ScreenNode } from '../../types/screen-node'
import { screenComponentMap } from '../../components/screen-widgets/config'
import { useScreenPreviewData } from '../../composables/screens/useScreenPreviewData'
import { useScreenProject } from '../../composables/screens/useScreenProject'
import { getNodeDatasetId, supportsDatasetRows } from '../../utils/screen-node'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string

const screenTitle = ref('大屏画布')
const publishedVersion = ref('未发布')
const { nodes, loadProject: loadProjectDetail } = useScreenProject(projectId)

const { datasetData, fetchAllDatasetData, setupRefreshTimers } = useScreenPreviewData()

// Auto-scaling logic to fit screen
const scale = ref(1)
const canvasWidth = computed(() => (projectId === 'scr-005' ? 2560 : 1920))
const canvasHeight = computed(() => (projectId === 'scr-005' ? 1440 : 1080))

const canvasStyle = computed(() => ({
  width: `${canvasWidth.value}px`,
  height: `${canvasHeight.value}px`,
  transform: `scale(${scale.value})`,
  transformOrigin: 'center center',
}))

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

function handleResize() {
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  const scaleX = (windowWidth * 0.95) / canvasWidth.value
  const scaleY = (windowHeight * 0.90) / canvasHeight.value
  scale.value = Math.min(scaleX, scaleY, 1)
}

async function loadProject() {
  try {
    const item = await loadProjectDetail()
    screenTitle.value = item.name
    publishedVersion.value = item.publishedVersion || '未发布'
    await fetchAllDatasetData(nodes.value)
    setupRefreshTimers(nodes.value)
  } catch (err) {
    console.error(err)
  }
}

function backToEditor() {
  router.push(`/screens/${projectId}/editor`)
}

function backToList() {
  router.push({ name: 'screens' })
}

onMounted(() => {
  loadProject()
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
:deep(body) {
  margin: 0;
  padding: 0;
}
</style>
