<template>
  <div class="h-full w-full rounded-lg border border-slate-800/80 bg-slate-900 p-3 flex items-center justify-between text-slate-300 select-none overflow-hidden">
    <!-- Time section -->
    <div class="flex items-center gap-3">
      <div class="text-2xl font-bold font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.2)] tracking-wider">
        {{ timeStr }}
      </div>
      <div class="border-l border-slate-800 pl-3 text-[10px] text-slate-400 font-mono uppercase tracking-wider leading-tight">
        <div>{{ dateStr }}</div>
        <div class="text-cyan-400/80">{{ weekStr }}</div>
      </div>
    </div>

    <!-- Weather section -->
    <div class="flex items-center gap-2 text-right">
      <div class="text-[10px] font-mono text-slate-400 leading-tight">
        <div class="text-slate-200">GigaFactory-01</div>
        <div>PM2.5: 12 (极佳)</div>
      </div>
      <div class="rounded bg-slate-800/60 px-2 py-1 text-xs border border-slate-800/40 text-cyan-300 font-semibold flex items-center gap-1.5">
        <span>☀️ 24°C 晴</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const timeStr = ref('00:00:00')
const dateStr = ref('2026-07-11')
const weekStr = ref('星期六')

let timer: ReturnType<typeof setInterval> | null = null

const weeks = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function updateClock() {
  const d = new Date()
  
  // Format time: HH:MM:SS
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  timeStr.value = `${hh}:${mm}:${ss}`
  
  // Format date: YYYY-MM-DD
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const date = String(d.getDate()).padStart(2, '0')
  dateStr.value = `${year}-${month}-${date}`
  
  // Weekday
  weekStr.value = weeks[d.getDay()]
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>
