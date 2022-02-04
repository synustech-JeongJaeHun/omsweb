<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Point from './Point.ce.vue';

import { points } from '../points'

</script>

<template>
  <Layer>
    <defs>
      <!-- <polygon
        id="point"
        points="0,60 20,40 30,30 40,20 60,0 40,-20, 30,-30 20,-40 0,-60 -20,-40 -30,-30 -40,-20 -60,0 -40,20 -30,30 -20,40"
      />-->
      <circle id="point" r="50" fill="black" />
    </defs>
    <Point v-for="point of points" :key="point.id" :point="point" />
  </Layer>
</template>
