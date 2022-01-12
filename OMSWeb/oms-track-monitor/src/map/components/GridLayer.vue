<script setup lang="ts">
import { mapSizePropertiesInfo } from '../mapSizeProperties';
import Layer from './Layer.vue';

const
  MapMargin = 3000,
  MapCornerStroke = "grey",
  MapCornerStrokeWidth = 20,
  PatternWidth = 10,
  PatternHeight = 10,
  PatternStroke = "grey",
  PatternStrokeWidth = 1
</script>

<template>
  <Layer>
    <defs>
      <pattern id="mapGridPattern" x="0" y="0" :width="PatternWidth" :height="PatternHeight">
        <line
          :x1="0"
          :y1="PatternHeight / 2"
          :x2="PatternWidth"
          :y2="PatternHeight / 2"
          :stroke="PatternStroke"
          :stroke-width="PatternStrokeWidth"
        />
        <line
          :x1="PatternWidth / 2"
          :y1="0"
          :x2="PatternWidth / 2"
          :y2="PatternHeight"
          :stroke="PatternStroke"
          :stroke-width="PatternStrokeWidth"
        />
      </pattern>
    </defs>

    <rect
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