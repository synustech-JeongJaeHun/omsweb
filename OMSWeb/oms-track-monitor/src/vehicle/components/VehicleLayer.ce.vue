<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Vehicle from './Vehicle.ce.vue';
import { vehicles } from '../vehicles'

</script>

<template>
  <Layer>
    <defs>
      <circle id="vehicle" r="80" fill="none" stroke="red" stroke-width="40"></circle>
    </defs>

    <Vehicle v-for="vehicle of vehicles" :key="vehicle.id" :vehicle="vehicle" />
  </Layer>
</template>