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

const emit = defineEmits<{
  (e: "apple", value: "A"): void
  (e: "blue", value: { B: number }): void
}>()

// const exposed: IOMSTrackMonitor = {
//   adjust_floaters: () => {},
// }
// defineExpose(exposed)


function emitB(event: any) {

  console.log('B', event)
  emit('blue', { B: Date.now() })
}
</script>

<template>
  <button type="button" @click="emit('apple', 'A')">A</button>
  <button type="button" @click="emitB($event)">B</button>
</template>

<style>
</style>