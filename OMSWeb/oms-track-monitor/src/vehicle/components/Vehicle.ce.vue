<script setup lang="ts">
import { Vehicle } from '../types/Vehicle'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { usePointPoisiton } from '../../point/points';
import { computed } from 'vue';

const props = defineProps<{
  vehicle: Vehicle
}>()

const currnetPointPosition = usePointPoisiton(computed(() => props.vehicle.curPoint))



</script>

<template>
  <svg
    class="overflow-visible cursor-pointer"
    :x="currnetPointPosition.x"
    :y="currnetPointPosition.y"
  >
    <use href="#vehicle">
      <animateMotion path />
    </use>
    <RasterizedText y="70" :text="props.vehicle.logicalId" />
  </svg>
</template>