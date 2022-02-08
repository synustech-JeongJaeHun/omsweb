<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Station from './Station.ce.vue';
import { stations } from '../stations'
</script>

<template>
  <Layer>
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
        m -56 -18 
        l 0 -36 
        l 36 0 
        m 36 0 
        l 36 0 
        l 0 36 
        m 0 36 
        l 0 36 
        l -36 0 
        m -36 0 
        l -36 0 
        l 0 -36 
        m 0 -36"
      />
      <rect id="station-group-shadow" x="-70" y="-70" width="140" height="140" />
    </defs>

    <Station v-for="station of stations" :key="station.id" :station="station" />
  </Layer>
</template>
