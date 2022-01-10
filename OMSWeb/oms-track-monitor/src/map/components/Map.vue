<script setup lang="ts">
import { computed } from 'vue';
import Grid from './Grid.vue';
import Layer from './Layer.vue';

const emit = defineEmits<{
  (event: 'backdrop'): void
}>()

</script>

<template>
  <div class="container" @click="emit('backdrop')">
    <Grid />
    <Layer />
    <Layer />
    <Layer />
    <Layer />
    <Layer />
    <!-- <Segments /> -->
    <slot name="points" />
    <slot name="buffers" />
    <slot name="stations" />
    <slot name="mtls" />
    <slot name="vehicles" />
  </div>
</template>

<style scoped>
</style>