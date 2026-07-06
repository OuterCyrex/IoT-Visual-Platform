<template>
  <div class="widget widget-text">
    <span>{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>
