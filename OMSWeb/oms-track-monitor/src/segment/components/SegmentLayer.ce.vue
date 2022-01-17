<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Segment from './Segment.ce.vue';
import { segments } from '../segments'
import SegmentSymbol from './SegmentSymbol.vue';

</script>

<template>
  <Layer>
    <defs>
      <SegmentSymbol v-for="segment of segments" :key="segment.id" :segment="segment" />
    </defs>
    <Segment v-for="segment of segments" :key="segment.id" :segment="segment" />
  </Layer>
</template>