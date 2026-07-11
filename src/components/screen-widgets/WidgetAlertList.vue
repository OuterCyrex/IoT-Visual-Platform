<template>
  <div class="h-full w-full rounded-2xl border border-rose-400/20 bg-slate-950/95 p-4 text-slate-100">
    <div class="mb-4 flex items-center justify-between">
      <div class="text-xs uppercase tracking-[0.3em] text-rose-200/80">
        {{ text || '告警列表' }}
      </div>
      <div class="rounded-full bg-rose-400/10 px-3 py-1 text-[11px] text-rose-200">
        {{ alertRows.length }} items
      </div>
    </div>

    <div class="space-y-3">
      <div
        v-for="(item, index) in alertRows"
        :key="`${item.message}-${index}`"
        class="rounded-xl border border-rose-400/10 bg-[linear-gradient(135deg,rgba(127,29,29,0.22),rgba(15,23,42,0.3))] px-3 py-3"
      >
        <div class="flex items-start gap-3">
          <div :class="item.dotClass" class="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" />
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium text-slate-100">
              {{ item.message }}
            </div>
            <div class="mt-2 flex items-center justify-between gap-3 text-xs">
              <span class="uppercase tracking-[0.2em] text-slate-500">{{ item.level }}</span>
              <span class="text-slate-400">T+{{ index + 1 }} min</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!alertRows.length" class="flex h-[calc(100%-3rem)] items-center justify-center text-sm text-slate-500">
        No alerts
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
  if (!props.xField) return []

  return props.rows.slice(0, 6).map((row) => {
    const level = props.yField ? String(row[props.yField] ?? 'info') : 'info'
    return {
      message: String(row[props.xField!] ?? 'Unknown alert'),
      level,
      dotClass: getDotClass(level),
    }
  })
})
</script>
