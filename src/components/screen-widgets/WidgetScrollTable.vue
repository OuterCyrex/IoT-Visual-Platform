<template>
  <div class="h-full w-full rounded-lg border border-slate-800/80 bg-slate-900 text-slate-200 p-3 flex flex-col overflow-hidden">
    <div class="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-800/60 pb-1.5 flex justify-between items-center select-none">
      <span>{{ text || '实时运行日志表' }}</span>
      <span v-if="!hasData" class="text-[9px] text-slate-500">(演示数据)</span>
    </div>

    <!-- Table Header -->
    <div class="flex border-b border-slate-800/50 pb-1 text-[10px] text-cyan-500 font-mono font-bold uppercase select-none">
      <div v-for="col in headers" :key="col" class="flex-1 px-1 truncate">{{ col }}</div>
    </div>

    <!-- Table Rows -->
    <div class="flex-1 overflow-hidden mt-1 text-[11px] relative">
      <div class="absolute inset-0 overflow-y-auto space-y-1.5 scroll-container pr-0.5">
        <div 
          v-for="(row, index) in displayRows" 
          :key="index"
          class="flex py-1.5 px-1 border-b border-slate-800/30 hover:bg-slate-800/30 transition-all font-mono"
        >
          <div v-for="col in headers" :key="col" class="flex-1 truncate pr-1 text-slate-300">
            {{ row[col] }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    text?: string
    datasetId?: string
    rows?: Record<string, unknown>[]
  }>(),
  {
    rows: () => [],
  }
)

const hasData = computed(() => {
  return Boolean(props.datasetId && props.rows && props.rows.length > 0)
})

const displayRows = computed(() => {
  if (hasData.value) {
    return props.rows
  }
  return [
    { 时间: '11:05:12', 设备: 'PLC-01', 事件: '主偏心轮开始加工', 状态: '正常' },
    { 时间: '11:05:25', 设备: 'ROBOT-02', 事件: '机械手抓取点焊接', 状态: '正常' },
    { 时间: '11:05:40', 设备: 'CNC-03', 事件: '激光切割完成下线', 状态: '正常' },
    { 时间: '11:06:02', 设备: 'AGV-04', 事件: '自动导航搬运上线中', 状态: '正常' },
    { 时间: '11:06:20', 设备: 'PUMP-05', 事件: '冷却塔循环管道开阀', 状态: '警告' }
  ]
})

const headers = computed(() => {
  const rows = displayRows.value
  if (!rows || rows.length === 0) return []
  return Object.keys(rows[0]).slice(0, 4) // Show top 4 fields
})
</script>

<style scoped>
.scroll-container::-webkit-scrollbar {
  width: 4px;
}
.scroll-container::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 2px;
}
.scroll-container::-webkit-scrollbar-thumb:hover {
  background: #0891b2;
}
</style>
