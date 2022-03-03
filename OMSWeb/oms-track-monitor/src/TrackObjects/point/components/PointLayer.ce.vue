<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import Point from './Point.ce.vue';
import { points } from '../points'
import { visibleStylesInfo } from 'src/styles/styles';
</script>

<template>
  <Layer id="point-layer" :data-is-label-visible="visibleStylesInfo.pointLabel">
    <Point v-for="point of points" :key="point.id" :point="point" />
  </Layer>
</template>
