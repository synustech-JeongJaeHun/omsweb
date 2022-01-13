<script setup lang="ts">
import { Vehicle } from '../types/Vehicle'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { findPointById } from '../../point/points';
import { computed, readonly } from 'vue';

const props = defineProps<{
  vehicle: Vehicle
}>()

const currentPoint = readonly(computed(() => findPointById(props.vehicle.curPoint) ?? { x: 0, y: 0 }))
</script>



<template>
  <svg class="overflow-visible" :x="currentPoint.x" :y="currentPoint.y">
    <use href="#vehicle" />
    <RasterizedText y="70" :text="props.vehicle.logicalId" />
  </svg>
</template>