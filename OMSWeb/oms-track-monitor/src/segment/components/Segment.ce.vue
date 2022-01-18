<script setup lang="ts">
import { Segment } from '../types/Segment'
import { getSegmentPathId } from '../utils/segment'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';

const DefaultStrokeWidth = 10

const props = defineProps<{
  segment: Segment
}>()

</script>

<template>
  <svg class="overflow-visible cursor-pointer">
    <use
      :href="`#${getSegmentPathId(props.segment.id)}`"
      stroke="black"
      :stroke-width="DefaultStrokeWidth"
    />
    <RasterizedText y="70" :text="props.segment.logicalId" />
  </svg>
</template>