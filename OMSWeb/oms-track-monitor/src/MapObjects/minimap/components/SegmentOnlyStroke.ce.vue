<script setup lang="ts">
import { Segment } from 'src/TrackObjects/segment/types/Segment';

const props = defineProps<{
  segment: Segment
}>()
</script>

<template>
  <path :d="props.segment.d" stroke="black" stroke-width="100" fill="none" />
</template>