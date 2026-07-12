<template>
  <!-- Real ECharts canvas container -->
  <div class="relative w-full h-full flex flex-col p-3 rounded-lg bg-gradient-to-br from-slate-900/40 via-slate-900/30 to-cyan-950/20 backdrop-blur-md border border-cyan-500/10 text-slate-200 overflow-hidden shadow-[inset_0_0_12px_rgba(6,182,212,0.03)]">
    <div
      class="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-800/60 pb-1.5 flex justify-between items-center select-none">
      <span>{{ text || '趋势分析图表' }}</span>

      <span v-if="loading" class="text-[9px] text-slate-500 animate-pulse">
        更新中...
      </span>
      <span v-if="!hasData" class="text-[9px] text-slate-500">
        (演示数据)
      </span>
    </div>

    <div ref="chartRef" class="flex-1 w-full min-h-0"></div>
  </div>
</template>


<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  computed,
  nextTick
} from 'vue'

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
  return Boolean(
    props.datasetId &&
    props.rows &&
    props.rows.length > 0
  )
})



function initChart() {
  if (!chartRef.value) return
  chartInstance = echarts.init(
    chartRef.value,
    'dark',
    {
      renderer: 'canvas'
    }
  )
  updateChartOptions()
  resizeObserver = new ResizeObserver(() => {
    chartInstance?.resize()
  })
  resizeObserver.observe(chartRef.value)
}



function updateChartOptions() {
  if (!chartInstance && chartRef.value) {
    chartInstance = echarts.init(
      chartRef.value,
      'dark',
      {
        renderer: 'canvas'
      }
    )
  }
  if (!chartInstance) return

  const keys = props.rows && props.rows.length > 0 ? Object.keys(props.rows[0]) : []
  const xFieldToUse = hasData.value ? (props.xField || keys[0] || 'time') : 'time'
  const yFieldToUse = hasData.value ? (props.yField || keys[1] || 'val') : 'val'
  const rowsToUse = hasData.value ? props.rows! : [
    { time: '10:00', val: 42 },
    { time: '11:00', val: 65 },
    { time: '12:00', val: 35 },
    { time: '13:00', val: 78 },
    { time: '14:00', val: 54 }
  ]

  const xData = rowsToUse.map(
    row => String(row[xFieldToUse] ?? '')
  )
  const yData = rowsToUse.map(
    row => Number(row[yFieldToUse]) || 0
  )
  chartInstance.setOption({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,23,42,0.95)',
      borderColor: '#06b6d4',
      borderWidth: 1,
      textStyle: {
        color: '#f8fafc',
        fontSize: 11
      }
    },
    grid: {
      left: '3%',
      right: '3%',
      top: '15%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xData,
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#334155'
        }
      },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 9,
        rotate: 15
      }

    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#1e293b',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 9
      }
    },
    series: [
      {
        name: props.yField,
        type: 'line',
        data: yData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: '#06b6d4'
        },


        itemStyle: {
          color: '#06b6d4',
          borderColor: '#ecfeff',
          borderWidth: 1
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(
            0,
            0,
            0,
            1,
            [
              {
                offset: 0,
                color: 'rgba(6,182,212,0.35)'
              },
              {
                offset: 1,
                color: 'rgba(6,182,212,0)'
              }
            ]
          )
        }
      }
    ]
  })
}




watch(
  () => [
    props.rows,
    props.xField,
    props.yField,
    props.text
  ],

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
  {
    deep: true
  }
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