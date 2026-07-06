<template>
  <div class="widget widget-rect">
    <span>{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>
