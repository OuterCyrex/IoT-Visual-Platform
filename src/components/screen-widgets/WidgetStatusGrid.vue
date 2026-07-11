<template>
  <div class="h-full w-full rounded-2xl border border-slate-800/80 bg-slate-950 p-4 text-slate-100 flex flex-col">
    <div class="mb-3 flex items-center justify-between border-b border-slate-800/60 pb-1.5 select-none">
      <div class="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
        {{ text || '设备状态网格' }}
      </div>
      <div class="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
        {{ displayRows.length }} 设备
      </div>
    </div>

    <div v-if="displayRows && displayRows.length" class="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 gap-3 pr-1">
      <div
        v-for="(item, index) in displayRows"
        :key="`${item.name}-${index}`"
        class="rounded-xl border border-slate-800 bg-slate-900/40 p-2.5 flex items-center justify-between gap-2 hover:border-slate-700/80 transition-all"
      >
        <div class="min-w-0">
          <div class="truncate text-xs font-medium text-slate-300">
            {{ item.name }}
          </div>
          <div class="mt-1 text-[10px] text-slate-500 uppercase tracking-tight">
            {{ item.sub }}
          </div>
        </div>
        
        <div class="flex items-center gap-1.5 shrink-0">
          <span class="text-[10px]" :class="item.statusColor">{{ item.statusText }}</span>
          <span :class="item.dotClass" class="h-2 w-2 rounded-full shrink-0" />
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center text-xs text-slate-500">
      {{ datasetId ? '无数据记录' : '请绑定数据集' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    text?: string
    datasetId?: string
    xField?: string
    yField?: string
    rows?: Record<string, unknown>[]
  }>(),
  {
    rows: () => [],
  }
)

const displayRows = computed(() => {
  if (!props.xField || !props.rows.length) {
    // default preview state when not bound to dataset
    return [
      { name: '加工中心 CNC-01', sub: 'A区', statusText: '运行中', statusColor: 'text-emerald-400', dotClass: 'bg-emerald-500 shadow-[0_0_8px_#10b981]' },
      { name: '机械手 ARM-02', sub: 'B区', statusText: '备用中', statusColor: 'text-amber-400', dotClass: 'bg-amber-500' },
      { name: '空压机 COMP-03', sub: '站房', statusText: '故障', statusColor: 'text-rose-500', dotClass: 'bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]' },
      { name: '冷却泵 PUMP-04', sub: '辅机', statusText: '离线', statusColor: 'text-slate-500', dotClass: 'bg-slate-600' }
    ]
  }

  return props.rows.slice(0, 8).map((row) => {
    const name = String(row[props.xField!] ?? '未知设备')
    // Look for potential location/sub-label field or just show ID as secondary text
    const keys = Object.keys(row)
    const subKey = keys.find(k => k !== props.xField && k !== props.yField && typeof row[k] === 'string')
    const sub = subKey ? String(row[subKey]) : 'SYS'

    const rawStatus = props.yField ? String(row[props.yField!] ?? '').toLowerCase() : ''
    
    let statusText = '运行'
    let statusColor = 'text-emerald-400'
    let dotClass = 'bg-emerald-500 shadow-[0_0_8px_#10b981]'

    if (rawStatus.includes('critical') || rawStatus.includes('fail') || rawStatus.includes('error') || rawStatus.includes('故障')) {
      statusText = '故障'
      statusColor = 'text-rose-400'
      dotClass = 'bg-rose-500 animate-pulse shadow-[0_0_10px_#ef4444]'
    } else if (rawStatus.includes('warning') || rawStatus.includes('standby') || rawStatus.includes('warn') || rawStatus.includes('待机') || rawStatus.includes('备用')) {
      statusText = '待机'
      statusColor = 'text-amber-400'
      dotClass = 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
    } else if (rawStatus.includes('offline') || rawStatus.includes('disabled') || rawStatus.includes('离线') || rawStatus.includes('停机')) {
      statusText = '离线'
      statusColor = 'text-slate-500'
      dotClass = 'bg-slate-600'
    } else {
      // standard running / online
      if (rawStatus) {
        statusText = String(row[props.yField!])
      }
    }

    return {
      name,
      sub,
      statusText,
      statusColor,
      dotClass
    }
  })
})
</script>
