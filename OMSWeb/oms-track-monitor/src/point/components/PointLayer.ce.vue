<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Point from './Point.ce.vue';

import { points } from '../points'

</script>

<template>
  <Layer>
    <defs>
      <circle id="point" r="50" fill="black" />
    </defs>
    <Point v-for="point of points" :key="point.id" :point="point" />
  </Layer>
</template>
