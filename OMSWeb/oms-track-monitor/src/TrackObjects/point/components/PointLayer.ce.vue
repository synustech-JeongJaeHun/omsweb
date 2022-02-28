<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import Point from './Point.ce.vue';
import { points } from '../points'
import PointCircle from './PointCircle.ce.vue';
import { toRef } from 'vue';
import { visibleStylesInfo } from 'src/styles/styles';

const isPointLabelVisible = toRef(visibleStylesInfo, "pointLabel")
</script>

<template>
  <Layer id="point-layer" :data-is-label-visible="isPointLabelVisible">
    <defs>
      <!-- <polygon
        id="point"
        points="0,60 20,40 30,30 40,20 60,0 40,-20, 30,-30 20,-40 0,-60 -20,-40 -30,-30 -40,-20 -60,0 -40,20 -30,30 -20,40"
      />-->
      <PointCircle />
    </defs>
    <Point v-for="point of points" :key="point.id" :point="point" />
  </Layer>
</template>
