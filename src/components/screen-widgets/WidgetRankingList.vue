<template>
  <div class="h-full w-full rounded-2xl border border-violet-400/20 bg-slate-950/95 p-4 text-slate-100">
    <div class="mb-4 flex items-center justify-between">
      <div class="text-xs uppercase tracking-[0.3em] text-violet-200/80">
        {{ text || '排行看板' }}
      </div>
      <div class="rounded-full bg-violet-400/10 px-3 py-1 text-[11px] text-violet-200">
        Top {{ rankedRows.length }}
      </div>
    </div>

    <div class="space-y-3">
      <div
        v-for="(item, index) in rankedRows"
        :key="`${item.label}-${index}`"
        class="rounded-xl border border-white/5 bg-white/4 px-3 py-3"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
            :class="index < 3 ? 'bg-violet-400/20 text-violet-200' : 'bg-slate-800 text-slate-300'"
          >
            {{ index + 1 }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="truncate text-sm font-medium text-slate-100">
              {{ item.label }}
            </div>
            <div class="mt-2 h-1.5 rounded-full bg-slate-800">
              <div
                class="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                :style="{ width: `${item.percent}%` }"
              />
            </div>
          </div>
          <div class="shrink-0 text-right">
            <div class="text-lg font-semibold text-white">
              {{ item.value }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="!rankedRows.length" class="flex h-[calc(100%-3rem)] items-center justify-center text-sm text-slate-500">
        No ranking data
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type RankedItem = {
  label: string
  value: number
  percent: number
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

const hasData = computed(() => Boolean(props.xField && props.yField && props.rows && props.rows.length > 0))

const rankedRows = computed<RankedItem[]>(() => {
  const xFieldToUse = hasData.value ? props.xField! : 'name'
  const yFieldToUse = hasData.value ? props.yField! : 'val'
  const rowsToUse = hasData.value ? props.rows : [
    { name: '高能耗设备 #1', val: 95 },
    { name: '中能耗设备 #2', val: 70 },
    { name: '低能耗设备 #3', val: 45 }
  ]

  const items = rowsToUse
    .map((row) => ({
      label: String(row[xFieldToUse] ?? 'Unknown'),
      value: Number(row[yFieldToUse]) || 0,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const maxValue = items[0]?.value || 1

  return items.map((item) => ({
    ...item,
    percent: Math.max(12, Math.round((item.value / maxValue) * 100)),
  }))
})
</script>
