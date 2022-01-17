<script setup lang="ts">
import { Mtl } from '../types/Mtl'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { computed } from 'vue';
import { usePointPoisiton } from '../../point/points';

const props = defineProps<{
  mtl: Mtl
}>()

const position = usePointPoisiton(computed(() => props.mtl.pointId))

</script>

<template>
  <svg class="overflow-visible cursor-pointer" :x="position.x" :y="position.y">
    <use href="#mtl" />
    <RasterizedText y="70" :text="props.mtl.logicalId" />
  </svg>
</template>
