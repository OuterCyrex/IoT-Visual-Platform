<template>
  <div class="h-full w-full relative border border-cyan-500/20 bg-slate-950/90 rounded-xl overflow-hidden flex flex-col p-4 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]">
    <!-- Cyberpunk Corner Accents -->
    <div class="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 rounded-tl"></div>
    <div class="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 rounded-tr"></div>
    <div class="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 rounded-bl"></div>
    <div class="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 rounded-br"></div>
    
    <!-- Title Area -->
    <div class="text-xs uppercase tracking-[0.25em] text-cyan-300 font-semibold border-b border-slate-800/80 pb-2 mb-3 select-none flex items-center justify-between">
      <span>{{ text || '边框装饰容器' }}</span>
      <div class="flex items-center gap-1">
        <span class="w-1 h-1 rounded-full bg-cyan-400 animate-pulse"></span>
        <span class="w-3 h-[1px] bg-cyan-500/50"></span>
      </div>
    </div>
    
    <!-- Empty space for absolute-positioned elements -->
    <div class="flex-1"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text?: string
}>()
</script>
