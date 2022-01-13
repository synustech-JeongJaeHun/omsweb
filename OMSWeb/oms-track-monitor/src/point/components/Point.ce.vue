<script setup lang="ts">
import { Point } from '../types/Point'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';

const props = defineProps<{
  point: Point
}>()
</script>


<template>
  <svg class="overflow-visible" :x="props.point.x" :y="props.point.y">
    <use href="#point" />
    <RasterizedText y="70" :text="props.point.logicalId" />
  </svg>
</template>