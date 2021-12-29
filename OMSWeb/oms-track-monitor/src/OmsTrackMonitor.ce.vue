<script setup lang="ts">
import { ref } from 'vue';
import { IOMSTrackMonitor } from './legacies/IOmsTrackMonitor';

const props = defineProps<{
  vehicles: []
  segments: []
  points: []
  stations: []
  buffer: []

}>()

const emits = defineEmits<{
  (e: "clickSegment", value: {}): void
}>()

const count = ref(0)

// const exposed: IOMSTrackMonitor = {
//   adjust_floaters: () => {},
// }
// defineExpose(exposed)

</script>

<template>
  <button type="button" @click="count = count - 1">-</button>
  {{ count }}
  <button type="button" @click="count = count + 1">+</button>
</template>

<style>
</style>