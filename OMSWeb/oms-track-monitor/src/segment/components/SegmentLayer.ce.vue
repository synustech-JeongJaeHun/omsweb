<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Segment from './Segment.ce.vue';
import { segments } from '../segments'
import SegmentDirectionTriangle from './SegmentDirectionTriangle.ce.vue';

</script>

<template>
  <Layer class="segment-layer">
    <defs>
      <SegmentDirectionTriangle />
    </defs>
    <Segment v-for="segment of segments" :key="segment.id" :segment="segment" />
  </Layer>
</template>