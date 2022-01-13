<script setup lang="ts">
import GridLayer from './GridLayer.ce.vue';
import EventLayer from './EventLayer.ce.vue';
import PointLayer from '../../point/components/PointLayer.ce.vue';
import BufferLayer from '../../buffer/components/BufferLayer.ce.vue';
import StationLayer from '../../station/components/StationLayer.ce.vue';
import ZcuLayer from '../../zcu/components/ZcuLayer.ce.vue';
import MtlLayer from '../../mtl/components/MtlLayer.ce.vue';
import VehicleLayer from '../../vehicle/components/VehicleLayer.ce.vue';
import SegmentLayer from '../../segment/components/SegmentLayer.ce.vue';

const emit = defineEmits<{
  (event: 'backdrop'): void
}>()

</script>

<template>
  <div>
    <GridLayer />
    <!-- group -->
    <!-- cluster -->
    <SegmentLayer />
    <PointLayer />
    <BufferLayer />
    <StationLayer />
    <ZcuLayer />
    <MtlLayer />
    <VehicleLayer />
    <EventLayer />
  </div>
</template>