<script setup lang="ts">
import { mapSizeProperties } from '../mapSizeProperties';
import Layer from './Layer.vue';

const
  width = 10,
  height = 10,
  stroke = "grey",
  strokeWidth = 0.1


</script>

<template>
  <Layer>
    <defs>
      <pattern id="mapGridPattern" x="0" y="0" :width="0.05" :height="0.05">
        <line
          :x1="0"
          :y1="height / 2"
          :x2="width"
          :y2="height / 2"
          :stroke="stroke"
          :stroke-width="strokeWidth"
        />
        <line
          :x1="width / 2"
          :y1="0"
          :x2="width / 2"
          :y2="height"
          :stroke="stroke"
          :stroke-width="strokeWidth"
        />
      </pattern>
    </defs>

    <rect
      fill="url(#mapGridPattern)"
      x="0"
      y="0"
      :stroke="stroke"
      :width="mapSizeProperties.maxX"
      :height="mapSizeProperties.maxY"
    />
  </Layer>
</template>