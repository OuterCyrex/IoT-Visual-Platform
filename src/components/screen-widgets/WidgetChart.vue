<template>
  <!-- Real ECharts canvas container (Only shown when data is loaded) -->
  <div v-if="hasData" class="relative w-full h-full flex flex-col p-3 rounded bg-slate-900 border border-slate-800/80 text-slate-200 overflow-hidden">
    <div class="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-800/60 pb-1.5 flex justify-between items-center select-none">
      <span>{{ text || '数据监控图表' }}</span>
      <span v-if="loading" class="text-[9px] text-slate-500 animate-pulse">更新中...</span>
    </div>
    <div ref="chartRef" class="flex-1 w-full min-h-0"></div>
  </div>

  <!-- Previous blank/light design (Shown in Editor before data binding) -->
  <div v-else class="widget widget-chart">
    <span>{{ text || '图表占位' }}</span>
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
  
  if (hasData.value) {
    chartInstance = echarts.init(chartRef.value, 'dark', {
      renderer: 'canvas',
    })
    updateChartOptions()
  }

  // Set up resize observer to keep canvas responsive
  resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  resizeObserver.observe(chartRef.value)
}

function updateChartOptions() {
  if (!hasData.value) {
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
    return
  }

  if (!chartInstance && chartRef.value) {
    chartInstance = echarts.init(chartRef.value, 'dark', {
      renderer: 'canvas',
    })
  }

  if (!chartInstance) return

  const xData = props.rows.map((row) => String(row[props.xField!] ?? ''))
  const yData = props.rows.map((row) => Number(row[props.yField!]) || 0)

  chartInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      borderColor: '#0891b2',
      borderWidth: 1,
      textStyle: { color: '#f8fafc', fontSize: 11 },
    },
    grid: { left: '3%', right: '3%', top: '15%', bottom: '5%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xData,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', fontSize: 9, rotate: 15 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 9 },
    },
    series: [
      {
        name: props.yField,
        data: yData,
        type: 'bar',
        barMaxWidth: '30px',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#06b6d4' },
            { offset: 1, color: '#0891b2' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  })
}

// Watch props and data changes
watch(
  () => [props.rows, props.xField, props.yField, props.text],
  async () => {
    if (hasData.value) {
      await nextTick()
      updateChartOptions()
    } else {
      if (chartInstance) {
        chartInstance.dispose()
        chartInstance = null
      }
    }
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
