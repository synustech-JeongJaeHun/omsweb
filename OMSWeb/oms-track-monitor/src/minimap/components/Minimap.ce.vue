<script setup lang="ts">
import { segments } from '../../segment/segments';
import Segment from '../../segment/components/Segment.ce.vue';
import { mapSizePropertiesInfo } from '../../map/mapSizeProperties';
import { cameraInfo } from '../../map/camera';

const
  MapMargin = 3000

</script>

<template>
  <svg
    :viewBox="`${(-1) * MapMargin} ${(-1) * MapMargin} ${mapSizePropertiesInfo.maxX + 2 * MapMargin} ${mapSizePropertiesInfo.maxY + 2 * MapMargin}`"
    :style="{
      maxWidth: `20vw`,
      maxHeight: `20vh`,
      backgroundColor: 'white',
      border: '2px solid black'
    }"
  >
    <rect
      :x="cameraInfo.x"
      :y="cameraInfo.y"
      :width="cameraInfo.viewBoxWidth"
      :height="cameraInfo.viewBoxHeight"
      fill="rgba(0,0,0,0.3)"
      stroke="black"
      stroke-width="500"
    />
    <Segment v-for="segment of segments" :key="segment.id" :segment="segment" :strokeWidth="100" />
  </svg>
</template>