<script setup lang="ts">
import { cameraInfo } from '../camera'
import { elementRectInfo } from '../elementRect';
import MapRotate from '../../rotate/components/MapRotate.ce.vue';
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-rendering
// https://developer.mozilla.org/ko/docs/Web/CSS/will-change
// https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident
</script>

<template>
  <svg
    x="0"
    y="0"
    :width="elementRectInfo.width"
    :height="elementRectInfo.height"
    :viewBox="cameraInfo.viewBox"
    shape-rendering="optimizeSpeed"
    text-rendering="optimizeSpeed"
    style="will-change: viewBox;"
    :data-zoom-level="cameraInfo.zoomLevel"
  >
    <!-- 
      rotate not working in svg, so use g for rotate
      https://stackoverflow.com/questions/50412618/rotating-nested-svg

      https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform#rotate
      rotate(<a> [<x> <y>])
      unit of a is degree, x y are center of rotating
    -->
    <MapRotate>
      <slot />
    </MapRotate>
  </svg>
</template>