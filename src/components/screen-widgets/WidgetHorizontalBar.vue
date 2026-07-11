<template>
  <div class="relative w-full h-full flex flex-col p-3 rounded bg-slate-900 border border-slate-800/80 text-slate-200 overflow-hidden">
    <div class="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-800/60 pb-1.5 flex justify-between items-center select-none">
      <span>{{ text || '横向排行图表' }}</span>
      <span v-if="!hasData" class="text-[9px] text-slate-500">(演示数据)</span>
    </div>
    <div ref="chartRef" class="flex-1 w-full min-h-0"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = withDefaults(
  defineProps<{
    text?: string
    datasetId?: string
    xField?: string
    yField?: string
    rows?: any[]
    loading?: boolean
  }>(),
  {
    rows: () => [],
  }
)

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const hasData = computed(() => {
  return Boolean(props.datasetId && props.xField && props.yField && props.rows && props.rows.length > 0)
})

function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value, 'dark', { renderer: 'canvas' })
  updateChartOptions()
  resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  resizeObserver.observe(chartRef.value)
}

function updateChartOptions() {
  if (!chartInstance && chartRef.value) {
    chartInstance = echarts.init(chartRef.value, 'dark', { renderer: 'canvas' })
  }
  if (!chartInstance) return

  const xFieldToUse = hasData.value ? props.xField! : 'label'
  const yFieldToUse = hasData.value ? props.yField! : 'value'
  const rowsToUse = hasData.value ? props.rows : [
    { label: '车间 A', value: 85 },
    { label: '车间 B', value: 72 },
    { label: '车间 C', value: 90 },
    { label: '车间 D', value: 64 }
  ]

  // Reverse lists for horizontal bar chart so top ranks appear at the top
  const yData = rowsToUse.map((row) => String(row[xFieldToUse] ?? '')).reverse()
  const xData = rowsToUse.map((row) => Number(row[yFieldToUse]) || 0).reverse()

  chartInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#0891b2',
      borderWidth: 1,
      textStyle: { color: '#f8fafc', fontSize: 11 },
    },
    grid: { left: '3%', right: '7%', top: '5%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 9 },
    },
    yAxis: {
      type: 'category',
      data: yData,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 9 },
    },
    series: [
      {
        name: props.yField || '数值',
        data: xData,
        type: 'bar',
        barMaxWidth: '16px',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#3b82f6' },
            { offset: 1, color: '#06b6d4' },
          ]),
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  })
}

watch(
  () => [props.rows, props.xField, props.yField, props.text],
  async () => {
    await nextTick()
    updateChartOptions()
  },
  { deep: true }
)

onMounted(() => {
  initChart()
})

onUnmounted(() => {
  if (resizeObserver && chartRef.value) {
    resizeObserver.unobserve(chartRef.value)
  }
  chartInstance?.dispose()
})
</script>
