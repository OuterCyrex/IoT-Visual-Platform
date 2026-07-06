<template>
  <div class="widget widget-circle">
    <span>{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string
}>()
</script>
