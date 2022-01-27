<script setup lang="ts">
import { Segment } from '../types/Segment'
import { getSegmentPathId } from '../utils/segment'
import { computed, readonly } from 'vue';
import SegmentDirection from './SegmentDirection.ce.vue';
import { encodeCommandsToD } from '../../utils/svg/pathSegment';

const DefaultStrokeWidth = 20

const props = defineProps<{
  segment: Segment
}>()

const color = readonly(computed(() => props.segment.disabled ? 'purple' : 'grey'))

</script>

<template>
  <svg ref="selfElement" class="overflow-visible cursor-pointer">
    <use
      :href="`#${getSegmentPathId(props.segment.id)}`"
      :stroke="color"
      :stroke-width="DefaultStrokeWidth"
    />
    <SegmentDirection :d="encodeCommandsToD(props.segment.pathCommands)" :color="color" />
  </svg>
</template>