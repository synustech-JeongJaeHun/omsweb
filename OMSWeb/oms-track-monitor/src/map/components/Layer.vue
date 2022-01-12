<script setup lang="ts">
import { cameraInfo } from '../camera'
</script>

<template>
  <svg
    :width="cameraInfo.elementWidth"
    :height="cameraInfo.elementHeight"
    :viewBox="cameraInfo.viewBox"
    style="position: absolute;"
  >
    <slot />
  </svg>
</template>