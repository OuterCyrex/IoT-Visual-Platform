<template>
  <div
    class="h-full w-full overflow-hidden rounded-2xl border border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.22),transparent_45%),linear-gradient(160deg,rgba(15,23,42,0.96),rgba(15,23,42,0.82))] p-4 text-slate-100 shadow-[0_18px_50px_rgba(8,145,178,0.18)]"
  >
    <div class="flex h-full flex-col justify-between">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-xs uppercase tracking-[0.32em] text-cyan-300/80">
            {{ titleText }}
          </div>
          <div class="mt-2 text-sm text-slate-400">
            {{ subtitleText }}
          </div>
        </div>
        <div class="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] text-cyan-200">
          LIVE
        </div>
      </div>

      <div class="mt-5 flex items-end justify-between gap-4">
        <div class="min-w-0">
          <div class="truncate text-4xl font-semibold leading-none text-white">
            {{ valueText }}
          </div>
          <div class="mt-3 h-1.5 rounded-full bg-slate-800">
            <div
              class="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400"
              :style="{ width: `${accentWidth}%` }"
            />
          </div>
        </div>
        <div class="text-right">
          <div class="text-[11px] uppercase tracking-[0.28em] text-slate-500">
            Status
          </div>
          <div class="mt-2 text-sm font-medium text-emerald-300">
            Stable
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
    xField?: string
    yField?: string
    rows?: Record<string, unknown>[]
  }>(),
  {
    rows: () => [],
  }
)

const firstRow = computed(() => props.rows[0] ?? {})

const titleText = computed(() => props.text || '核心指标')

const subtitleText = computed(() => {
  if (props.xField && firstRow.value[props.xField] != null) {
    return String(firstRow.value[props.xField])
  }
  return props.xField || '实时数据概览'
})

const valueText = computed(() => {
  if (props.yField && firstRow.value[props.yField] != null) {
    return String(firstRow.value[props.yField])
  }
  return '--'
})

const accentWidth = computed(() => {
  const rawValue = Number(props.yField ? firstRow.value[props.yField] : 0)
  if (!Number.isFinite(rawValue)) return 62
  return Math.min(100, Math.max(12, Math.round(Math.abs(rawValue) % 100)))
})
</script>
