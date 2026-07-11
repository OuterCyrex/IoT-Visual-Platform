<template>
  <div class="h-full w-full rounded-2xl border border-amber-400/20 bg-slate-950/95 p-4 text-slate-100">
    <div class="flex h-full flex-col justify-between">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="text-xs uppercase tracking-[0.3em] text-amber-200/80">
            {{ titleText }}
          </div>
          <div class="mt-2 text-sm text-slate-400">
            {{ labelText }}
          </div>
        </div>
        <div class="text-3xl font-semibold text-white">
          {{ percentText }}
        </div>
      </div>

      <div class="mt-6">
        <div class="h-4 overflow-hidden rounded-full bg-slate-800">
          <div
            class="h-full rounded-full bg-[linear-gradient(90deg,#f59e0b_0%,#f97316_45%,#ef4444_100%)] shadow-[0_0_24px_rgba(249,115,22,0.32)] transition-all duration-500"
            :style="{ width: `${progressValue}%` }"
          />
        </div>
        <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>0%</span>
          <span>Target 100%</span>
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

const titleText = computed(() => props.text || '执行进度')

const labelText = computed(() => {
  if (props.xField && firstRow.value[props.xField] != null) {
    return String(firstRow.value[props.xField])
  }
  return '当前任务'
})

const progressValue = computed(() => {
  const rawValue = Number(props.yField ? firstRow.value[props.yField] : 0)
  if (!Number.isFinite(rawValue)) return 0
  return Math.min(100, Math.max(0, Math.round(rawValue)))
})

const percentText = computed(() => `${progressValue.value}%`)
</script>
