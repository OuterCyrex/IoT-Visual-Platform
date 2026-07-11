<template>
  <div class="h-full w-full rounded-full border border-cyan-500/30 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15),transparent_70%)] flex flex-col items-center justify-center p-2 relative shadow-[0_0_15px_rgba(6,182,212,0.1)]">
    <!-- Inner ring -->
    <div class="absolute inset-2.5 rounded-full border border-dashed border-cyan-500/10"></div>
    
    <span class="text-[10px] text-cyan-300 font-mono select-none truncate max-w-full px-1">{{ props.text || '状态环' }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text?: string
}>()
</script>
