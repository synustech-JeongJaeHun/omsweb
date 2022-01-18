<script setup lang="ts">
import { Segment } from '../../segment/types/Segment';
import { getSegmentPathId } from '../../segment/utils/segment';

const DefaultStrokeWidth = 100

const props = defineProps<{
  segment: Segment
}>()

</script>

<template>
  <use
    :href="`#${getSegmentPathId(props.segment.id)}`"
    stroke="black"
    :stroke-width="DefaultStrokeWidth"
  />
</template>