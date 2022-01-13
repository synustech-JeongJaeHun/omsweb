<script setup lang="ts">
import { Mtl } from '../types/Mtl'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { computed, readonly, Ref } from 'vue';
import { findPointById } from '../../point/points';

const props = defineProps<{
  mtl: Mtl
}>()

const position = readonly(computed(() => findPointById(props.mtl.pointId) ?? { x: 0, y: 0 }))

</script>

<template>
  <svg class="overflow-visible" :x="position.x" :y="position.y">
    <use href="#mtl" />
    <RasterizedText y="70" :text="props.mtl.logicalId" />
  </svg>
</template>
