<script setup lang="ts">
import { Segment } from '../types/Segment';
import { getSegmentPathId } from '../utils/segment'
import { encodeCommandsToD } from '../../utils/svg/pathSegment';

const props = defineProps<{
  segment: Segment
}>()

</script>

<template>
  <path
    :id="`${getSegmentPathId(props.segment.id)}`"
    :d="encodeCommandsToD(props.segment.pathCommands)"
    fill="none"
  />
</template>