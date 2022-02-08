<script setup lang="ts">
import { Segment } from '../../segment/types/Segment';
import { getSegmentPathId } from '../../segment/utils/segment';

const props = defineProps<{
  segment: Segment
}>()

</script>

<template>
  <use :href="`#${getSegmentPathId(props.segment.id)}`" stroke="black" stroke-width="100" />
</template>