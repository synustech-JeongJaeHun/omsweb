<script setup lang="ts">
import { Point } from '../types/Point'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';

const props = defineProps<{
  point: Point
}>()

function eventPropagationTest() {
  alert(`POINT CLICKED ${props.point.logicalId}`)
}
</script>


<template>
  <svg class="overflow-visible cursor-pointer" :x="props.point.x" :y="props.point.y">
    <use href="#point" @click="eventPropagationTest()" />
    <RasterizedText y="70" :text="props.point.logicalId" />
  </svg>
</template>