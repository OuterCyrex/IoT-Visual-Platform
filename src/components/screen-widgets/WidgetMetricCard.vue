<template>
  <div class="relative w-full h-full flex flex-col p-3 rounded bg-slate-900 border border-slate-800/80 text-slate-200 overflow-hidden">
    <!-- Header to match charts -->
    <div class="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-800/60 pb-1.5 flex justify-between items-center select-none">
      <span>{{ titleText }}</span>
      <span v-if="!hasData" class="text-[9px] text-slate-500">(演示数据)</span>
      <span v-else class="rounded border border-cyan-500/30 bg-cyan-400/10 px-1.5 py-0.5 text-[8px] text-cyan-300">LIVE</span>
    </div>

    <!-- Body content -->
    <div class="flex-1 flex flex-col justify-between min-h-0 pt-1">
      <div class="text-xs text-slate-400 truncate">
        {{ subtitleText }}
      </div>

      <div class="mt-2 flex items-end justify-between gap-4">
        <div class="min-w-0 flex-1">
          <div class="truncate text-3xl font-bold leading-none text-white font-mono">
            {{ valueText }}
          </div>
          <div class="mt-3 h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400"
              :style="{ width: `${accentWidth}%` }"
            />
          </div>
        </div>
        <div class="text-right shrink-0">
          <div class="text-[9px] uppercase tracking-wider text-slate-500">
            状态
          </div>
          <div class="mt-1 text-xs font-medium text-emerald-400">
            正常
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

const hasData = computed(() => Boolean(props.rows && props.rows.length > 0 && props.yField))

const firstRow = computed(() => {
  if (hasData.value) {
    return props.rows[0] ?? {}
  }
  return {
    sub: '演示副标题',
    val: '99.9'
  }
})

const titleText = computed(() => props.text || '核心指标')

const subtitleText = computed(() => {
  if (hasData.value) {
    if (props.xField && firstRow.value[props.xField] != null) {
      return String(firstRow.value[props.xField])
    }
    return props.xField || '实时数据概览'
  }
  return '演示指标描述'
})

const valueText = computed(() => {
  if (hasData.value) {
    return String(firstRow.value[props.yField!] ?? '--')
  }
  return '99.9'
})

const accentWidth = computed(() => {
  const fieldToUse = hasData.value ? props.yField! : 'val'
  const rawValue = Number(firstRow.value[fieldToUse])
  if (!Number.isFinite(rawValue)) return 62
  return Math.min(100, Math.max(12, Math.round(Math.abs(rawValue) % 100)))
})
</script>
