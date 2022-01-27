<script setup lang="ts">
import { cameraInfo } from '../../map/camera';
</script>

<template>
  <g :transform="`rotate(${(-1) * cameraInfo.rotate})`">
    <slot />
  </g>
</template>