<template>
  <div class="relative w-full h-full flex flex-col p-3 rounded bg-slate-900 border border-slate-800/80 text-slate-200 overflow-hidden">
    <!-- Header to match charts -->
    <div class="text-xs font-semibold text-cyan-400 mb-2 border-b border-slate-800/60 pb-1.5 flex justify-between items-center select-none">
      <span>{{ titleText }}</span>
      <span v-if="!hasData" class="text-[9px] text-slate-500">(演示数据)</span>
      <span class="font-mono text-cyan-300">{{ percentText }}</span>
    </div>

    <!-- Body content -->
    <div class="flex-1 flex flex-col justify-between min-h-0 pt-1">
      <div class="text-xs text-slate-400 truncate">
        {{ labelText }}
      </div>

      <div class="mt-3">
        <div class="h-3 overflow-hidden rounded-full bg-slate-800/80 border border-slate-700/30">
          <div
            class="h-full rounded-full bg-[linear-gradient(90deg,#06b6d4_0%,#3b82f6_50%,#10b981_100%)] shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all duration-500"
            :style="{ width: `${progressValue}%` }"
          />
        </div>
        <div class="mt-2 flex items-center justify-between text-[10px] text-slate-500">
          <span>0%</span>
          <span>目标 100%</span>
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
    label: '任务说明占位',
    val: 75
  }
})

const titleText = computed(() => props.text || '执行进度')

const labelText = computed(() => {
  if (hasData.value) {
    if (props.xField && firstRow.value[props.xField] != null) {
      return String(firstRow.value[props.xField])
    }
    return props.xField || '当前任务'
  }
  return '当前演示任务进度'
})

const progressValue = computed(() => {
  const fieldToUse = hasData.value ? props.yField! : 'val'
  const rawValue = Number(firstRow.value[fieldToUse])
  if (!Number.isFinite(rawValue)) return 0
  return Math.min(100, Math.max(0, Math.round(rawValue)))
})

const percentText = computed(() => `${progressValue.value}%`)
</script>
