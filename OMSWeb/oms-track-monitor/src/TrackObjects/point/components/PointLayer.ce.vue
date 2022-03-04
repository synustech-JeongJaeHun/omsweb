<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import Point from './Point.ce.vue';
import { points } from '../points'
</script>

<template>
  <Layer id="point-layer">
    <Point v-for="point of points" :key="point.id" :point="point" />
  </Layer>
</template>
