<template>
  <div class="widget widget-chart">
    <span>{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>
