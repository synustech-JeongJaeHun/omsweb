<script setup lang="ts">
import GridLayer from './GridLayer.vue';
import Layer from './Layer.vue';
import EventLayer from './EventLayer.vue';
import PointLayer from '../../point/components/PointLayer.vue';
import BufferLayer from '../../buffer/components/BufferLayer.vue';
import StationLayer from '../../station/components/StationLayer.vue';
import ZcuLayer from '../../zcu/components/ZcuLayer.vue';

const emit = defineEmits<{
  (event: 'backdrop'): void
}>()

</script>

<template>
  <div>
    <GridLayer />
    <!-- <Segments /> -->
    <PointLayer />
    <BufferLayer />
    <StationLayer />
    <ZcuLayer />
    <Layer />
    <Layer />
    <Layer />
    <Layer />
    <slot name="mtls" />
    <slot name="vehicles" />
    <EventLayer />
  </div>
</template>