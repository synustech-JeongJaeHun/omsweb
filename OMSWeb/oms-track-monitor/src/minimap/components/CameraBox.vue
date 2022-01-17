<script setup lang="ts">
import { cameraInfo } from '../../map/camera';
</script>


<template>
  <rect
    :x="cameraInfo.x"
    :y="cameraInfo.y"
    :width="cameraInfo.viewBoxWidth"
    :height="cameraInfo.viewBoxHeight"
    stroke="blue"
    storke-width="200"
  />
</template>