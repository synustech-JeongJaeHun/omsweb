<script setup lang="ts">
import Layer from '../../map/components/Layer.ce.vue';
import Segment from './Segment.ce.vue';
import { segments } from '../segments'
import SegmentDirectionTriangle from './SegmentDirectionTriangle.ce.vue';
import { toRef } from 'vue';
import { visibleStylesInfo } from '../../styles/styles';

const isDirectionVisible = toRef(visibleStylesInfo, 'segmentDirection')
</script>

<template>
  <Layer id="segment-layer" :data-is-direction-visible="isDirectionVisible">
    <defs>
      <SegmentDirectionTriangle />
    </defs>
    <Segment v-for="segment of segments" :key="segment.id" :segment="segment" />
  </Layer>
</template>