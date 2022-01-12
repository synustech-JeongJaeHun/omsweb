<script setup lang="ts">
import { Point } from '../types/Point'
const props = defineProps<{
  point: Point
}>()
</script>

<template>
  <svg :x="props.point.x" :y="props.point.y" style="overflow: visible">
    <circle r="20" fill="white" />
  </svg>
</template>