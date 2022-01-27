<script setup lang="ts">
import { cameraInfo } from '../camera'
import { mapSizePropertiesInfo } from '../mapSizeProperties';
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-rendering
// https://developer.mozilla.org/ko/docs/Web/CSS/will-change
</script>

<template>
  <svg
    x="0"
    y="0"
    :width="cameraInfo.elementWidth"
    :height="cameraInfo.elementHeight"
    :viewBox="cameraInfo.viewBox"
    shape-rendering="optimizeSpeed"
    text-rendering="optimizeSpeed"
    style="will-change: contents;"
    :data-zoom-level="cameraInfo.zoomLevel"
  >
    <!-- 
      rotate not working in svg, so use g for rotate
      https://stackoverflow.com/questions/50412618/rotating-nested-svg

      https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform#rotate
      rotate(<a> [<x> <y>])
      unit of a is degree, x y are center of rotating
    -->
    <g
      :transform="`rotate(${cameraInfo.rotate} ${mapSizePropertiesInfo.centerX} ${mapSizePropertiesInfo.centerY})`"
    >
      <slot />
    </g>
  </svg>
</template>