<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import Station from './Station.ce.vue';
import { stations } from '../stations'
</script>

<template>
  <Layer id="station-layer">
    <defs>
      <!-- 
        pointer-events for event from bounding-box
        https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pointer-events
      -->
      <path
        id="station"
        pointer-events="bounding-box"
        fill="none"
        d="
        M 3 10
        L 10 10
        L 10 3
        M 10 -3
        L 10 -10
        L 3 -10
        M -3 -10
        L -10 -10
        L -10 -3
        M -10 3
        L -10 10
        L -3 10"
      />
      <rect id="station-group-shadow" x="-16" y="-16" width="32" height="32" />
    </defs>

    <Station v-for="station of stations" :key="station.id" :station="station" />
  </Layer>
</template>
