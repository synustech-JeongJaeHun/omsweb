<script setup lang="ts">
import { computed, readonly, toRef } from 'vue';
import { usePointPoisiton } from '../../point/points';
import { addVectors, getUnitVector, multipleVector } from '../../utils/vector';
import { Station } from '../types/Station'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { useGroupColor } from '../../group/groups';

const props = defineProps<{
  station: Station
}>()

const startPointPosition = usePointPoisiton(toRef(props.station, 'pointId'))
const nextPointPosition = usePointPoisiton(toRef(props.station, 'nextPoint'))

const position = readonly(computed(() => {
  if (startPointPosition.value === undefined || nextPointPosition.value === undefined)
    return { x: 0, y: 0 }

  const unitVector = getUnitVector({
    x: nextPointPosition.value.x - startPointPosition.value.x,
    y: nextPointPosition.value.y - startPointPosition.value.y
  })

  const offsetVector = multipleVector(unitVector, props.station.offset)
  const position = addVectors({ x: startPointPosition.value.x, y: startPointPosition.value.y }, offsetVector)
  return { x: Math.ceil(position.x), y: Math.ceil(position.y) }
}))

const groupColor = useGroupColor('station', toRef(props.station, 'id'))

function eventPropagationTest() {
  alert(`STATION CLICKED ${props.station.logicalId}`)
}
</script>

<template>
  <svg class="overflow-visible cursor-pointer" :x="position.x" :y="position.y">
    <use v-show="groupColor" href="#station-group-shadow" class="group-shadow" :fill="groupColor" />
    <use href="#station" @click="eventPropagationTest()" />
    <RasterizedText class="invert" y="70" :text="props.station.logicalId" />
  </svg>
</template>