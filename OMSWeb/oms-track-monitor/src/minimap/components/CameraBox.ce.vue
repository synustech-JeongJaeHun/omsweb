<script setup lang="ts">
import { cameraInfo } from '../../map/camera';
</script>

<template>
  <rect
    :x="cameraInfo.x"
    :y="cameraInfo.y"
    :width="cameraInfo.viewBoxWidth"
    :height="cameraInfo.viewBoxHeight"
    fill="rgba(0,0,0,0.3)"
    stroke="black"
    stroke-width="500"
  />
</template>