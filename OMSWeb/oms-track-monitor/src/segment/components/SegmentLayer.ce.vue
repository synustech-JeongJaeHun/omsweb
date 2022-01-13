<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Segment from './Segment.ce.vue';
import { segments } from '../segments'

</script>

<template>
  <Layer>
    <defs></defs>

    <Segment v-for="segment of segments" :key="segment.id" :segment="segment" />
  </Layer>
</template>