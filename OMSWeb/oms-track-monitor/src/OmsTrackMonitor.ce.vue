<script setup lang="ts">
import { ref } from 'vue';

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

</script>

<template>
  <button type="button" @click="count = count - 1">-</button>
  {{ count }}
  <button type="button" @click="count = count + 1">+</button>
</template>

<style>
</style>