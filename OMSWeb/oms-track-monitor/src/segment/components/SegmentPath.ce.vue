<script setup lang="ts">
import { computed } from 'vue';
import { usePath } from '../segments';
import { Segment } from '../types/Segment';
import { getSegmentPathId } from '../utils/segment'

const props = defineProps<{
  segment: Segment
}>()

const path = usePath(computed(() => props.segment))

</script>

<template>
  <path :id="`${getSegmentPathId(props.segment.id)}`" :d="path" fill="none" />
</template>