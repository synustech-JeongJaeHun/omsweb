<script setup lang="ts">
import { Point } from '../types/Point'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';

const props = defineProps<{
  point: Point
}>()
</script>


<template>
  <svg :x="props.point.x" :y="props.point.y" style="overflow: visible">
    <!-- <circle r="50" fill="black" /> -->
    <use href="#point" />
    <RasterizedText y="70" :text="props.point.logicalId" />
    <!-- <image y="70" :href="rasterisedIdTextImageDataUrl" /> -->
    <!-- <text y="70">{{ props.point.logicalId }}</text> -->
  </svg>
</template>