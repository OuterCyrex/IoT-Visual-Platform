<template>
  <div class="relative w-full h-full flex flex-col p-3 rounded bg-slate-900 border border-slate-800/80 text-slate-200 overflow-hidden">
    <div class="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-800/60 pb-1.5 flex justify-between items-center select-none">
      <span>{{ text || '环形进度仪' }}</span>
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
  return Boolean(props.datasetId && props.yField && props.rows && props.rows.length > 0)
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
  const rowsToUse = hasData.value ? props.rows : [{ label: '进度率', value: 68 }]

  const firstRow = rowsToUse[0] || {}
  const val = Math.min(100, Math.max(0, Number(firstRow[yFieldToUse]) || 0))
  const label = xFieldToUse ? String(firstRow[xFieldToUse] ?? '运行') : '运行'

  chartInstance.setOption({
    backgroundColor: 'transparent',
    title: {
      text: `${val}%`,
      subtext: label,
      left: 'center',
      top: '38%',
      textStyle: {
        fontSize: 22,
        color: '#ffffff',
        fontWeight: 'bold',
        fontFamily: 'monospace'
      },
      subtextStyle: {
        fontSize: 10,
        color: '#94a3b8'
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['68%', '84%'],
        center: ['50%', '52%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: [
          {
            value: val,
            name: '已完成',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#06b6d4' },
                { offset: 1, color: '#3b82f6' }
              ])
            }
          },
          {
            value: 100 - val,
            name: '未完成',
            itemStyle: {
              color: '#1e293b'
            }
          }
        ]
      }
    ]
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
