<template>
  <div class="h-full w-full rounded-lg border border-slate-800 bg-slate-950/40 shadow-[inset_0_0_15px_rgba(6,182,212,0.03)] flex flex-col items-center justify-center p-3 transition-all relative">
    <!-- Cybernetic brackets in corners -->
    <div class="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-cyan-500/50"></div>
    <div class="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-cyan-500/50"></div>
    <div class="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-cyan-500/50"></div>
    <div class="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-cyan-500/50"></div>
    
    <span class="text-[10px] text-cyan-400/60 font-mono tracking-widest uppercase select-none">{{ props.text || '容器' }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text?: string
}>()
</script>
