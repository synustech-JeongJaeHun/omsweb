<script setup lang="ts">
import { Segment } from '../types/Segment';
import { getSegmentPathId } from '../utils/segment'

const props = defineProps<{
  segment: Segment
}>()

</script>

<template>
  <path :id="`${getSegmentPathId(props.segment.id)}`" :d="props.segment.d" fill="none" />
</template>