<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Mtl from './Mtl.ce.vue';
import { mtls } from '../mtls'
</script>

<template>
  <Layer>
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
        M -60 -60
        L -40 -40
        L -60 -20
        L -40 0
        L -60 20
        L -40 40
        L -60 60
        L 60 60
        L 40 40
        L 60 20
        L 40 0
        L 60 -20
        L 40 -40
        L 60 -60
        M -40 40
        L 40 40
      "
      />
    </defs>

    <Mtl v-for="mtl of mtls" :key="mtl.id" :mtl="mtl" />
  </Layer>
</template>