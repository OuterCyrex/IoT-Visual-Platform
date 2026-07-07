<template>
    <div v-if="hasData"
        class="relative w-full h-full flex flex-col p-3 rounded bg-slate-900 border border-slate-800/80 text-slate-200 overflow-hidden">
        <div class="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-800/60 pb-1.5">
            {{ text || '占比分析' }}
        </div>
        <div ref="chartRef" class="flex-1 w-full min-h-0"></div>
    </div>

    <div v-else class="widget widget-chart">
        <span>{{ text || '饼图占位' }}</span>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'

const props = withDefaults(
    defineProps<{
        text?: string
        datasetId?: string
        xField?: string
        yField?: string
        rows?: any[]
    }>(),
    {
        rows: () => []
    }
)

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const hasData = computed(() =>
    Boolean(
        props.datasetId &&
        props.xField &&
        props.yField &&
        props.rows?.length
    )
)

function updateChart() {
    if (!chartRef.value || !hasData.value) return

    if (!chartInstance) {
        chartInstance = echarts.init(chartRef.value, 'dark')
    }

    chartInstance.setOption({
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15,23,42,.95)',
            borderColor: '#06b6d4',
            textStyle: {
                color: '#f8fafc'
            }
        },
        legend: {
            bottom: 0,
            textStyle: {
                color: '#94a3b8'
            }
        },
        series: [
            {
                type: 'pie',
                radius: ['35%', '65%'],
                center: ['50%', '45%'],
                data: props.rows!.map(row => ({
                    name: String(row[props.xField!] ?? ''),
                    value: Number(row[props.yField!]) || 0
                })),
                label: {
                    color: '#cbd5e1'
                },
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#0f172a',
                    borderWidth: 2
                }
            }
        ]
    })
}

watch(
    () => [props.rows, props.xField, props.yField],
    async () => {
        await nextTick()
        updateChart()
    },
    { deep: true }
)

onMounted(() => {
    updateChart()
})

onUnmounted(() => {
    chartInstance?.dispose()
})
</script>