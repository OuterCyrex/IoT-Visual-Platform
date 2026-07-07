<template>
  <div class="h-full w-full rounded border border-blue-500/30 bg-blue-500/5 flex items-center justify-center">
    <span class="text-xs text-blue-400 font-mono">{{ props.text || '矩形' }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text?: string
}>()
</script>
