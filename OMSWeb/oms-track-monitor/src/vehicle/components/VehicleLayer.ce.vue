<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Vehicle from './Vehicle.ce.vue';
import { vehicles } from '../vehicles'
</script>

<template>
  <Layer>
    <defs>
      <marker
        id="vehicle-line-green"
        viewBox="0 0 10 10"
        refX="1"
        refY="5"
        markerUnits="strokeWidth"
        markerWidth="3"
        markerHeight="3"
        orient="auto"
        fill="green"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
      <marker
        id="vehicle-line-blue"
        viewBox="0 0 10 10"
        refX="1"
        refY="5"
        markerUnits="strokeWidth"
        markerWidth="3"
        markerHeight="3"
        orient="auto"
        fill="blue"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>
    <Vehicle v-for="vehicle of vehicles" :key="vehicle.id" :vehicle="vehicle" />
  </Layer>
</template>