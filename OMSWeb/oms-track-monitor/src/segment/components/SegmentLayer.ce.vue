<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Segment from './Segment.ce.vue';
import { segments } from '../segments'
import SegmentPath from './SegmentPath.ce.vue';

</script>

<template>
  <Layer>
    <defs>
      <SegmentPath v-for="segment of segments" :key="segment.id" :segment="segment" />
    </defs>
    <Segment v-for="segment of segments" :key="segment.id" :segment="segment" />
  </Layer>
</template>