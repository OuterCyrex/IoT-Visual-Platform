<template>
  <div class="h-full w-full flex flex-col items-center justify-center p-2 text-center select-none">
    <span class="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.2)]">
      {{ props.text }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text?: string
}>()
</script>
