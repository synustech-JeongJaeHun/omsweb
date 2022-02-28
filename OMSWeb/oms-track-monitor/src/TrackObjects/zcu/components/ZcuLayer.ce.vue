<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import Zcu from './Zcu.ce.vue';

import { zcus } from '../zcus'

</script>

<template>
  <Layer>
    <defs>
      <!-- 
        pointer-events for event from bounding-box
        https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pointer-events
      -->
      <path
        id="zcu"
        pointer-events="bounding-box"
        d="M 0 -50 L 50 0 L 0 50 L -50 0 Z"
        stroke="black"
        stroke-width="10"
      />
    </defs>
    <Zcu v-for="zcu of zcus" :key="zcu.id" :zcu="zcu" />
  </Layer>
</template>
