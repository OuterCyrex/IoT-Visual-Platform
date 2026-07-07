<template>
  <div class="h-full w-full flex flex-col items-center justify-center p-2 text-center">
    <span class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
      {{ props.text }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text?: string
}>()
</script>
