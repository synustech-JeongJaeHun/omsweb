<script setup lang="ts">
import { Point } from '../types/Point'
const props = defineProps<{
  point: Point
}>()
</script>

<template>
  <circle :cx="props.point.x" :cy="props.point.y" />
</template>