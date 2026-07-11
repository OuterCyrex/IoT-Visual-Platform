<template>
    <div class="relative w-full h-full flex flex-col p-3 rounded bg-slate-900 border border-slate-800/80 text-slate-200 overflow-hidden">
        <div class="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-800/60 pb-1.5 flex justify-between items-center select-none">
            <span>{{ text || '占比分析' }}</span>
            <span v-if="!hasData" class="text-[9px] text-slate-500">(演示数据)</span>
        </div>
        <div ref="chartRef" class="flex-1 w-full min-h-0"></div>
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
        props.rows?.length
    )
)

function updateChart() {
    if (!chartRef.value) return

    if (!chartInstance) {
        chartInstance = echarts.init(chartRef.value, 'dark')
    }

    const keys = props.rows && props.rows.length > 0 ? Object.keys(props.rows[0]) : []
    const xFieldToUse = hasData.value ? (props.xField || keys[0] || 'name') : 'name'
    const yFieldToUse = hasData.value ? (props.yField || keys[1] || 'val') : 'val'
    const rowsToUse = hasData.value ? props.rows! : [
        { name: '类别一', val: 40 },
        { name: '类别二', val: 30 },
        { name: '类别三', val: 20 },
        { name: '类别四', val: 10 }
    ]

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
                data: rowsToUse.map(row => ({
                    name: String(row[xFieldToUse] ?? ''),
                    value: Number(row[yFieldToUse]) || 0
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