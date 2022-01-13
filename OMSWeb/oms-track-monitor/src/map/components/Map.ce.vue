<script setup lang="ts">
import GridLayer from './GridLayer.ce.vue';
import EventLayer from './EventLayer.ce.vue';
import PointLayer from '../../point/components/PointLayer.ce.vue';
import BufferLayer from '../../buffer/components/BufferLayer.ce.vue';
import StationLayer from '../../station/components/StationLayer.ce.vue';
import ZcuLayer from '../../zcu/components/ZcuLayer.ce.vue';

const emit = defineEmits<{
  (event: 'backdrop'): void
}>()

</script>

<template>
  <div>
    <GridLayer />
    <!-- group -->
    <!-- cluster -->
    <!-- segment + disabled -->
    <PointLayer />
    <BufferLayer />
    <StationLayer />
    <ZcuLayer />
    <!-- mtl -->
    <!-- vehicles + vehicle paths -->
    <EventLayer />
  </div>
</template>