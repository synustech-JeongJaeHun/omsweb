<script setup lang="ts">
import { mapSizePropertiesInfo } from '../mapSizeProperties';
import Layer from './Layer.ce.vue';

const
  MapMargin = 3000,
  MapCornerStroke = "black",
  MapCornerStrokeWidth = 20,
  unitLength = 1000,
  halfUnitLength = unitLength / 2,
  LineStroke = "grey",
  LineStrokeWidth = 5

</script>

<template>
  <Layer>
    <defs>
      <pattern
        id="mapGridPattern"
        :viewBox="`0 0 ${unitLength} ${unitLength}`"
        :width="unitLength"
        :height="unitLength"
        patternUnits="userSpaceOnUse"
      >
        <line
          :x1="0"
          :y1="halfUnitLength"
          :x2="unitLength"
          :y2="halfUnitLength"
          :stroke="LineStroke"
          :stroke-width="LineStrokeWidth"
        />
        <line
          :x1="halfUnitLength"
          :y1="0"
          :x2="halfUnitLength"
          :y2="unitLength"
          :stroke="LineStroke"
          :stroke-width="LineStrokeWidth"
        />
      </pattern>
    </defs>

    <!-- pointer-events="none" for map backdrop event -->
    <rect
      pointer-events="none"
      fill="url(#mapGridPattern)"
      :x="(-1) * MapMargin"
      :y="(-1) * MapMargin"
      :stroke="MapCornerStroke"
      :stroke-width="MapCornerStrokeWidth"
      :width="mapSizePropertiesInfo.maxX + (MapMargin * 2)"
      :height="mapSizePropertiesInfo.maxY + (MapMargin * 2)"
    />
  </Layer>
</template>