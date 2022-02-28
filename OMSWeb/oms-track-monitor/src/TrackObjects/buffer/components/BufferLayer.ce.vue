<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import Buffer from './Buffer.ce.vue';
import { buffers } from '../buffers'
import { toRef } from 'vue';
import { visibleStylesInfo } from 'src/styles/styles';

const isBufferVisible = toRef(visibleStylesInfo, 'buffer')
</script>

<template>
  <Layer id="buffer-layer" :data-is-buffer-visible="isBufferVisible">
    <defs>
      <!-- <polygon id="buffer" points="30,60 60,30 60,-30 30,-60 -30,-60 -60,-30 -60,30 -30,60" /> -->
      <!-- <polygon
        id="buffer-group-shadow"
        points="20,40 40,20 40,-20 20,-40 -20,-40 -40,-20 -40,20 -20,40"
      />-->
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
        M -56 -18 
        A 36 36 0 0 1 -18 -56
        M 18 -56
        A 36 36 0 0 1 56 -18
        M 56 18
        A 36 36 0 0 1 18 56
        M -18 56 
        A 36 36 0 0 1 -56 18
        "
      />
      <!-- <circle id="buffer" r="50" stroke="black" stroke-width="10" fill="none" /> -->
      <circle id="buffer-group-shadow" r="85" />
    </defs>

    <Buffer v-for="buffer of buffers" :key="buffer.id" :buffer="buffer" />
  </Layer>
</template>
