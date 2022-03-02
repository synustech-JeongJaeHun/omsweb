<script setup lang="ts">
import { cameraTotalInfo } from 'MapObjects/map/camera';
</script>

<template>
  <rect
    :x="cameraTotalInfo.x"
    :y="cameraTotalInfo.y"
    :width="cameraTotalInfo.viewBoxWidth"
    :height="cameraTotalInfo.viewBoxHeight"
    fill="rgba(0,0,0,0.3)"
    stroke="black"
    stroke-width="500"
  />
</template>