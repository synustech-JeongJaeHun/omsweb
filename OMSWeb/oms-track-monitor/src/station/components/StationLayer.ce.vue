<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Station from './Station.ce.vue';

import { stations } from '../stations'

</script>

<template>
  <Layer>
    <defs>
      <rect
        id="station"
        x="-50"
        y="-50"
        width="100"
        height="100"
        stroke="black"
        stroke-width="10"
        fill="none"
      />
      <rect id="station-group-shadow" x="-60" y="-60" width="120" height="120" />
    </defs>

    <Station v-for="station of stations" :key="station.id" :station="station" />
  </Layer>
</template>
