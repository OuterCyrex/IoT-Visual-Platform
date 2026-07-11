<template>
  <div class="relative w-full h-full flex flex-col p-3 rounded bg-slate-900 border border-slate-800/80 text-slate-200 overflow-hidden">
    <div class="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-800/60 pb-1.5 flex justify-between items-center select-none">
      <span>{{ text || '仪表盘遥测' }}</span>
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

  const xFieldToUse = hasData.value ? props.xField! : 'unit'
  const yFieldToUse = hasData.value ? props.yField! : 'val'
  const rowsToUse = hasData.value ? props.rows : [{ unit: '单位', val: 65 }]

  const firstRow = rowsToUse[0] || {}
  const val = Number(firstRow[yFieldToUse]) || 0
  const unit = xFieldToUse ? String(firstRow[xFieldToUse] ?? xFieldToUse) : ''

  chartInstance.setOption({
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 5,
        radius: '95%',
        center: ['50%', '60%'],
        pointer: {
          icon: 'path://M12.8,0.7l12,80.1c1.2,7.8-3.9,15-11.7,16.2c-0.8,0.1-1.6,0.1-2.4,0l-12-80.1C-1.1,9.1,4,1.9,11.8,0.7C12.1,0.7,12.5,0.7,12.8,0.7z',
          length: '75%',
          width: 5,
          offsetCenter: [0, 0],
          itemStyle: {
            color: '#06b6d4'
          }
        },
        axisLine: {
          lineStyle: {
            width: 8,
            color: [
              [0.3, '#10b981'],
              [0.7, '#f59e0b'],
              [1, '#ef4444']
            ]
          }
        },
        axisTick: {
          distance: -8,
          length: 5,
          lineStyle: {
            color: '#fff',
            width: 1
          }
        },
        splitLine: {
          distance: -8,
          length: 10,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        axisLabel: {
          color: '#94a3b8',
          distance: 12,
          fontSize: 9
        },
        detail: {
          valueAnimation: true,
          formatter: `{value} ${unit}`,
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 'bold',
          offsetCenter: [0, '35%']
        },
        data: [
          {
            value: val
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
