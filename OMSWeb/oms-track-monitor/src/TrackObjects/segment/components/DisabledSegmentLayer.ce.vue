<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import { segmentDisableds } from '../segmentDisableds'
import { scaleStylesInfo } from 'src/styles/styles'
import SegmentDisabled from './SegmentDisabled.ce.vue'
</script>

<template>
  <Layer id="disabled-segment-layer">
    <defs>
      <path
        id="segment-direction-triangle"
        class="fixed-scale-stroke"
        :stroke-width="scaleStylesInfo.segmentDirection"
        :d="`M 0 5` + `L -5 -5` + `L 5 -5` + `Z`"
      />
    </defs>
    <SegmentDisabled
      v-for="segmentDisabled of segmentDisableds"
      :key="segmentDisabled.id"
      :segmentDisabled="segmentDisabled"
    />
  </Layer>
</template>
