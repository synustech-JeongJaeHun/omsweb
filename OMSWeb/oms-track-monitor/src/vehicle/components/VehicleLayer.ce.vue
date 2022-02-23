<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Vehicle from './Vehicle.ce.vue';
import { vehicles } from '../vehicles'
import { toRef } from 'vue';
import { visibleStylesInfo } from '../../styles/styles';

const isLineVisible = toRef(visibleStylesInfo, 'vehicleLine')
</script>

<template>
  <Layer id="vehicle-layer" :data-is-line-visible="isLineVisible">
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