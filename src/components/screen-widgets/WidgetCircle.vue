<template>
        <div
          class="h-full w-full rounded-full border border-purple-500/30 bg-purple-500/5 flex items-center justify-center"
        >
          <span class="text-xs text-purple-400 font-mono">{{ props.text || '圆形' }}</span>
        </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  text?: string
}>()
</script>
