<script setup lang="ts">
import { mapSizePropertiesInfo } from '../mapSizeProperties';
import Layer from './Layer.ce.vue';

const
  UnitLength = 3000,
  LineStroke = "rgba(128,128,128, 0.2)",
  LineStrokeWidth = 5,
  MapMargin = 3000,
  MapCornerStroke = "black",
  MapCornerStrokeWidth = 50

</script>

<template>
  <Layer>
    <defs>
      <!-- https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/patternUnits -->
      <pattern
        id="mapGridPattern"
        :viewBox="`0 0 ${UnitLength} ${UnitLength}`"
        :width="UnitLength"
        :height="UnitLength"
        patternUnits="userSpaceOnUse"
      >
        <rect
          x="0"
          y="0"
          :width="UnitLength"
          :height="UnitLength"
          :stroke="LineStroke"
          :stroke-width="LineStrokeWidth"
          fill="none"
        />
      </pattern>
    </defs>

    <!-- pointer-events="none" for map backdrop event -->
    <rect
      pointer-events="none"
      :x="(-1) * MapMargin"
      :y="(-1) * MapMargin"
      fill="url(#mapGridPattern)"
      :stroke="MapCornerStroke"
      :stroke-width="MapCornerStrokeWidth"
      :width="mapSizePropertiesInfo.maxX + (MapMargin * 2)"
      :height="mapSizePropertiesInfo.maxY + (MapMargin * 2)"
    />

    <circle id="originPoint" cx="0" cy="0" r="10" fill="rgba(0,0,0,0.5)" />

    <text x="0" y="0" text-anchor="middle" style="visibility: hidden; transform: scaleY(-1);">
      <animate
        attributeType="CSS"
        attributeName="visibility"
        begin="originPoint.mouseover"
        from="hidden"
        to="visible"
        dur="0.5s"
        fill="freeze"
      />
      <animate
        attributeType="CSS"
        attributeName="visibility"
        begin="originPoint.mouseleave"
        from="visible"
        to="hidden"
        dur="0.5s"
        fill="freeze"
      />Origin Point (0,0)
    </text>
  </Layer>
</template>