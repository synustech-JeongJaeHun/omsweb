<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue';
import ChjsVehicle from './ChjsVehicle.ce.vue';
import { vehicles } from '../vehicles'
</script>

<template>
  <Layer id="vehicle-layer">
    <defs>
      <defs>
        <filter x="0" y="0" width="1" height="1" id="vehicle-order-hotlot-background">
          <feFlood flood-color="orange" result="bg" />
          <feMerge>
            <feMergeNode in="bg" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter x="-0.1" y="-0.1" width="1.2" height="1.2" id="vehicle-order-hotlot-border">
          <feFlood flood-color="#ff8000" />
          <feComposite in="SourceGraphic" />
        </filter>
      </defs>
    </defs>
    <ChjsVehicle v-for="vehicle of vehicles" :key="vehicle.id" :vehicle="vehicle" />
  </Layer>
</template>
