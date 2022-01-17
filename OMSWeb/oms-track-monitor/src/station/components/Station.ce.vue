<script setup lang="ts">
import { computed, readonly } from 'vue';
import { usePointPoisiton } from '../../point/points';
import { addVectors, getUnitVector, multipleVector } from '../../utils/vector';
import { Station } from '../types/Station'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';

const props = defineProps<{
  station: Station
}>()

const startPointPosition = usePointPoisiton(computed(() => props.station.pointId))
const nextPointPosition = usePointPoisiton(computed(() => props.station.nextPoint))

const position = readonly(computed(() => {
  if (startPointPosition.value === undefined || nextPointPosition.value === undefined)
    return { x: 0, y: 0 }

  const unitVector = getUnitVector({
    x: nextPointPosition.value.x - startPointPosition.value.x,
    y: nextPointPosition.value.y - startPointPosition.value.y
  })

  const offsetVector = multipleVector(unitVector, props.station.offset)
  return addVectors({ x: startPointPosition.value.x, y: startPointPosition.value.y }, offsetVector)
}))

function eventPropagationTest() {
  alert(`STATION CLICKED ${props.station.logicalId}`)
}
</script>

<template>
  <svg class="overflow-visible cursor-pointer" :x="position.x" :y="position.y">
    <use href="#station" @click="eventPropagationTest()" />
    <RasterizedText y="70" :text="props.station.logicalId" />
  </svg>
</template>