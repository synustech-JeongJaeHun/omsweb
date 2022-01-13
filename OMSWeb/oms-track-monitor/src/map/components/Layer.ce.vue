<script setup lang="ts">
import { cameraInfo } from '../camera'

// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-rendering
// https://developer.mozilla.org/ko/docs/Web/CSS/will-change
</script>

<template>
  <svg
    :width="cameraInfo.elementWidth"
    :height="cameraInfo.elementHeight"
    :viewBox="cameraInfo.viewBox"
    shape-rendering="optimizeSpeed"
    text-rendering="optimizeSpeed"
    class="absolute"
    style="will-change: contents;"
    :data-zoom-level="cameraInfo.zoomLevel"
  >
    <slot />
  </svg>
</template>