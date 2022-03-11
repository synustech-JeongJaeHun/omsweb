<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import Mtl from './Mtl.ce.vue';
import { mtls } from '../mtls'
</script>

<template>
  <Layer id="mtl-layer">
    <defs>
      <!-- 
        pointer-events for event from visiblePainted (default value)
        mtl is always above point
        https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pointer-events
      -->
      <path
        id="mtl"
        pointer-events="visiblePainted"
        fill="none"
        d="
        M -12 -12
        L -8 -8
        L -12 -4
        L -8 0
        L -12 4
        L -8 8
        L -12 12
        L 12 12
        L 8 8
        L 12 4
        L 8 0
        L 12 -4
        L 8 -8
        L 12 -12
        M -8 8
        L 8 8
      "
      />
    </defs>

    <Mtl v-for="mtl of mtls" :key="mtl.id" :mtl="mtl" />
  </Layer>
</template>