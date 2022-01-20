<script setup lang="ts">
import { Segment } from '../types/Segment'
import { getSegmentPathId } from '../utils/segment'
import { computed, readonly } from 'vue';
import SegmentDirection from './SegmentDirection.ce.vue';

const DefaultStrokeWidth = 20

const props = defineProps<{
  segment: Segment
}>()

const hrefId = readonly(computed(() => getSegmentPathId(props.segment.id)))
const color = readonly(computed(() => props.segment.disabled ? 'purple' : 'grey'))

</script>

<template>
  <svg ref="selfElement" class="overflow-visible cursor-pointer">
    <use
      :href="`#${getSegmentPathId(props.segment.id)}`"
      :stroke="color"
      :stroke-width="DefaultStrokeWidth"
    />
    <SegmentDirection :segmentPathId="hrefId" :color="color" />
  </svg>
</template>