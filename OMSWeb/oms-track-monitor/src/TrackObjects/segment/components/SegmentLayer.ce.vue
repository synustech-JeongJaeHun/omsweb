<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import Segment from './Segment.ce.vue';
import { segments } from '../segments'
import { visibleStylesInfo } from 'src/styles/styles';
import { scaleStylesInfo } from 'src/styles/styles';
</script>

<template>
  <Layer id="segment-layer" :data-is-direction-visible="visibleStylesInfo.segmentDirection">
    <defs>
      <path
        id="segment-direction-triangle"
        class="fixed-scale-stroke"
        :stroke-width="scaleStylesInfo.segmentDirection"
        :d="`M 0 5` + `L -5 -5` + `L 5 -5` + `Z`"
      />
    </defs>
    <Segment v-for="segment of segments" :key="segment.id" :segment="segment" />
  </Layer>
</template>