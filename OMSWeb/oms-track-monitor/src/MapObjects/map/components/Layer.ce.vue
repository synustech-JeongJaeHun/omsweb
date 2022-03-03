<script setup lang="ts">
import { cameraTotalInfo } from '../camera'
import { elementRectInfo } from '../elementRect';
import MapRotate from 'MapObjects/rotate/components/MapRotate.ce.vue';
import { scaleLevelInfo } from 'src/MapObjects/scale/scale';
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-rendering
// https://developer.mozilla.org/en-US/docs/Web/CSS/custom-ident
</script>

<template>
  <svg
    class="will-change-viewBox"
    x="0"
    y="0"
    :width="elementRectInfo.width"
    :height="elementRectInfo.height"
    :viewBox="cameraTotalInfo.viewBox"
    shape-rendering="optimizeSpeed"
    text-rendering="optimizeSpeed"
    :data-scale-level="scaleLevelInfo"
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