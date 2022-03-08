<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import Buffer from './Buffer.ce.vue';
import { buffers } from '../buffers'
</script>

<template>
  <Layer id="buffer-layer">
    <defs>
      <!-- 
        pointer-events for event from bounding-box
        https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pointer-events
      -->
      <!-- 
        arc
        https://developer.mozilla.org/ko/docs/Web/SVG/Tutorial/Paths#arcs 
      -->
      <path
        id="buffer"
        pointer-events="bounding-box"
        fill="none"
        d="
        M -12 -4 
        A 8 8 0 0 1 -4 -12
        M 4 -12
        A 8 8 0 0 1 12 -4
        M 12 4
        A 8 8 0 0 1 4 12
        M -4 12 
        A 8 8 0 0 1 -12 4
        "
      />
      <circle id="buffer-group-shadow" r="22" />
    </defs>

    <Buffer v-for="buffer of buffers" :key="buffer.id" :buffer="buffer" />
  </Layer>
</template>
