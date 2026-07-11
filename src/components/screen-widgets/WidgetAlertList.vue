<template>
  <div class="relative w-full h-full flex flex-col p-3 rounded bg-slate-900 border border-slate-800/80 text-slate-200 overflow-hidden">
    <!-- Header matching charts -->
    <div class="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-800/60 pb-1.5 flex justify-between items-center select-none">
      <span>{{ text || '安全与健康告警日志' }}</span>
      <span class="rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] text-rose-400 border border-rose-500/20 animate-pulse">
        {{ alertRows.length }} 实时告警
      </span>
    </div>

    <!-- Scrollable container -->
    <div class="flex-1 overflow-hidden relative mt-1">
      <div class="absolute inset-0 overflow-y-auto space-y-2 scroll-container pr-0.5">
        <div
          v-for="(item, index) in alertRows"
          :key="`${item.message}-${index}`"
          class="rounded border border-slate-800/60 bg-slate-950/40 p-2.5 flex items-start gap-2.5 transition-all hover:bg-slate-800/20"
        >
          <div :class="item.dotClass" class="mt-1 h-2 w-2 shrink-0 rounded-full" />
          <div class="min-w-0 flex-1 leading-snug">
            <div class="text-[11px] text-slate-300 font-mono">
              {{ item.message }}
            </div>
            <div class="mt-1.5 flex items-center justify-between text-[9px] text-slate-500 font-mono">
              <span class="uppercase tracking-wider font-semibold" :class="item.level.toLowerCase().includes('critical') ? 'text-rose-400' : 'text-amber-400'">
                {{ item.level }}
              </span>
              <span>实时推送</span>
            </div>
          </div>
        </div>

        <div v-if="!alertRows.length" class="flex h-full items-center justify-center text-xs text-slate-500 font-mono">
          暂无活动状态告警
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type AlertItem = {
  message: string
  level: string
  dotClass: string
}

const props = withDefaults(
  defineProps<{
    text?: string
    xField?: string
    yField?: string
    rows?: Record<string, unknown>[]
  }>(),
  {
    rows: () => [],
  }
)

const hasData = computed(() => Boolean(props.xField && props.rows && props.rows.length > 0))

function getDotClass(level: string) {
  const normalized = level.toLowerCase()
  if (normalized.includes('high') || normalized.includes('critical') || normalized.includes('严重')) {
    return 'bg-rose-400 shadow-[0_0_16px_rgba(251,113,133,0.7)]'
  }
  if (normalized.includes('medium') || normalized.includes('warn') || normalized.includes('中')) {
    return 'bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.7)]'
  }
  return 'bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.7)]'
}

const alertRows = computed<AlertItem[]>(() => {
  const xFieldToUse = hasData.value ? props.xField! : 'message'
  const yFieldToUse = hasData.value ? props.yField! : 'level'
  const rowsToUse = hasData.value ? props.rows : [
    { message: '严重: 主电机轴承温度超限警告', level: 'Critical' },
    { message: '警告: 供电系统发生电压瞬时波动', level: 'Warning' },
    { message: '提示: 配件箱装料就绪', level: 'Info' }
  ]

  // Allow displaying up to 40 alarms with scroll bar
  return rowsToUse.slice(0, 40).map((row) => {
    const level = yFieldToUse ? String(row[yFieldToUse] ?? 'info') : 'info'
    return {
      message: String(row[xFieldToUse] ?? 'Unknown alert'),
      level,
      dotClass: getDotClass(level),
    }
  })
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
  background: #f43f5e;
}
</style>
