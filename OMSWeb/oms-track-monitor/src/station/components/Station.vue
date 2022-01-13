<script setup lang="ts">
import { computed, readonly, ref, watchEffect } from 'vue';
import { findPointById } from '../../point/points';
import { convertStringToImageDataUrl } from '../../utils/textToImage';
import { addVectors, getUnitVector, multipleVector } from '../../utils/vector';
import { Station } from '../types/Station'
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

const rasterisedIdTextImageDataUrl = ref<string>('')
watchEffect(async () => {
  const dataUrl = await convertStringToImageDataUrl(props.station.logicalId)
  rasterisedIdTextImageDataUrl.value = dataUrl
})
</script>

<template>
  <svg :x="position.x" :y="position.y" style="overflow: visible;">
    <use href="#station" />
    <image y="70" :href="rasterisedIdTextImageDataUrl" />
    <!-- <text y="70">{{ props.station.logicalId }}</text> -->
  </svg>
</template>