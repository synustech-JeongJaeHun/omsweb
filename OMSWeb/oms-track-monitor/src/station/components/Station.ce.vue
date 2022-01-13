<script setup lang="ts">
import { computed, readonly } from 'vue';
import { findPointById } from '../../point/points';
import { addVectors, getUnitVector, multipleVector } from '../../utils/vector';
import { Station } from '../types/Station'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';

const props = defineProps<{
  station: Station
}>()

const startPoint = readonly(computed(() => findPointById(props.station.pointId)))
const endPoint = readonly(computed(() => findPointById(props.station.nextPoint)))
const position = readonly(computed(() => {
  if (startPoint.value === undefined || endPoint.value === undefined)
    return { x: 0, y: 0 }

  const unitVector = getUnitVector({
    x: endPoint.value.x - startPoint.value.x,
    y: endPoint.value.y - startPoint.value.y
  })

  const offsetVector = multipleVector(unitVector, props.station.offset)
  return addVectors({ x: startPoint.value.x, y: startPoint.value.y }, offsetVector)
}))
</script>

<template>
  <svg class="overflow-visible" :x="position.x" :y="position.y">
    <use href="#station" />
    <RasterizedText y="70" :text="props.station.logicalId" />
    <!-- <image y="70" :href="rasterisedIdTextImageDataUrl" /> -->
    <!-- <text y="70">{{ props.station.logicalId }}</text> -->
  </svg>
</template>