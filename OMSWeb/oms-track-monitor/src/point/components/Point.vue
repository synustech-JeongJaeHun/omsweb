<script setup lang="ts">
import { Point } from '../types/Point'

const props = defineProps<{
  point: Point
}>()
</script>

<template>
  <svg :x="props.point.x" :y="props.point.y" style="overflow: visible">
    <!-- <circle r="50" fill="black" /> -->
    <use href="#point" />
    <!-- <text y="70">{{ props.point.logicalId }}</text> -->
  </svg>
</template>