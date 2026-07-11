<template>
  <div class="relative w-full h-full flex flex-col p-3 rounded bg-slate-900 border border-slate-800/80 text-slate-200 overflow-hidden">
    <div class="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-800/60 pb-1.5 flex justify-between items-center select-none">
      <span>{{ text || '多维特征雷达图' }}</span>
      <span v-if="loading" class="text-[9px] text-slate-500 animate-pulse">更新中...</span>
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
  return Boolean(props.datasetId && props.xField && props.yField && props.rows && props.rows.length >= 3)
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

  const xFieldToUse = hasData.value ? props.xField! : 'name'
  const yFieldToUse = hasData.value ? props.yField! : 'val'
  const rowsToUse = hasData.value ? props.rows! : [
    { name: '设备温度', val: 60 },
    { name: '物理振动', val: 80 },
    { name: '噪音分贝', val: 55 },
    { name: '能耗功率', val: 90 },
    { name: '运行时长', val: 75 }
  ]

  const indicators = rowsToUse.map(row => {
    const name = String(row[xFieldToUse] ?? '')
    const val = Number(row[yFieldToUse]) || 0
    const maxVal = val > 100 ? Math.ceil(val * 1.3) : 100
    return { name, max: maxVal }
  })

  const values = rowsToUse.map(row => Number(row[yFieldToUse]) || 0)

  chartInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: '#06b6d4',
      borderWidth: 1,
      textStyle: { color: '#f8fafc', fontSize: 11 }
    },
    radar: {
      indicator: indicators,
      shape: 'circle',
      radius: '70%',
      center: ['50%', '50%'],
      splitNumber: 4,
      axisName: {
        color: '#94a3b8',
        fontSize: 10
      },
      splitLine: {
        lineStyle: {
          color: [
            'rgba(6, 182, 212, 0.1)',
            'rgba(6, 182, 212, 0.2)',
            'rgba(6, 182, 212, 0.3)',
            'rgba(6, 182, 212, 0.4)'
          ].reverse()
        }
      },
      splitArea: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: 'rgba(6, 182, 212, 0.2)'
        }
      }
    },
    series: [
      {
        name: props.text || '综合评分',
        type: 'radar',
        data: [
          {
            value: values,
            name: '指标分布',
            symbol: 'circle',
            symbolSize: 6,
            itemStyle: {
              color: '#06b6d4'
            },
            areaStyle: {
              color: 'rgba(6, 182, 212, 0.25)'
            },
            lineStyle: {
              width: 2,
              color: '#06b6d4'
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
