<script setup lang="ts">
import { Segment } from '../types/Segment'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { findPointById } from '../../point/points';
import { computed, readonly } from 'vue';

const props = defineProps<{
  segment: Segment
}>()
</script>



<template>
  <svg class="overflow-visible">
    <use href="#segment" />
    <RasterizedText y="70" :text="props.segment.logicalId" />
  </svg>
</template>