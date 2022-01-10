<script setup lang="ts">
import { cameraInfo } from '../camera'
</script>

<template>
  <svg
    :width="cameraInfo.width"
    :height="cameraInfo.height"
    :viewBox="cameraInfo.viewBox"
    style="position: absolute;"
  >
    <slot />
  </svg>
</template>