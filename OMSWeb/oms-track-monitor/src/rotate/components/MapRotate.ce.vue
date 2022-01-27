<script setup lang="ts">
import { cameraInfo } from '../../map/camera';
import { mapSizePropertiesInfo } from '../../map/mapSizeProperties';
</script>

<template>
  <g
    :transform="`rotate(${cameraInfo.rotate} ${mapSizePropertiesInfo.centerX} ${mapSizePropertiesInfo.centerY})`"
  >
    <slot />
  </g>
</template>