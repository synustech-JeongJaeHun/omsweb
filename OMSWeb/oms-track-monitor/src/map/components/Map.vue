<script setup lang="ts">
import GridLayer from './GridLayer.vue';
import Layer from './Layer.vue';
import EventLayer from './EventLayer.vue';
import PointLayer from '../../point/components/PointLayer.vue';

const emit = defineEmits<{
  (event: 'backdrop'): void
}>()

</script>

<template>
  <div>
    <GridLayer />
    <!-- <Segments /> -->
    <PointLayer />
    <Layer />
    <Layer />
    <Layer />
    <Layer />
    <Layer />
    <slot name="points" />
    <slot name="buffers" />
    <slot name="stations" />
    <slot name="mtls" />
    <slot name="vehicles" />
    <EventLayer />
  </div>
</template>