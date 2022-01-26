<script setup lang="ts">
import { computed, readonly, toRef } from 'vue'
import { usePointPoisiton } from '../../point/points'
import { addVectors, getOrthogonalVector, getUnitVector, multipleVector, ZeroVector } from '../../utils/vector'
import { Buffer } from '../types/Buffer'
import RasterizedText from '../../map/components/RasterizedText.ce.vue'
import { useGroupColor } from '../../group/groups'

const BufferDirectionMargin = 500

const props = defineProps<{
  buffer: Buffer
}>()

const startPointPosition = usePointPoisiton(toRef(props.buffer, 'pointId'))
const nextPointPosition = usePointPoisiton(toRef(props.buffer, 'nextPoint'))
const position = readonly(computed(() => {
  if (startPointPosition.value === undefined || nextPointPosition.value === undefined)
    return { x: 0, y: 0 }

  const unitVector = getUnitVector({
    x: nextPointPosition.value.x - startPointPosition.value.x,
    y: nextPointPosition.value.y - startPointPosition.value.y
  })

  const offsetVector = multipleVector(unitVector, props.buffer.offset)
  const offsetPosition = addVectors({ x: startPointPosition.value.x, y: startPointPosition.value.y }, offsetVector)

  const orthogonalVector =
    props.buffer.direction === 'L' ? getOrthogonalVector(unitVector, 'counterclockwise')
      : props.buffer.direction === 'R' ? getOrthogonalVector(unitVector, 'clockwise')
        : ZeroVector
  const directionTransformVector = multipleVector(orthogonalVector, BufferDirectionMargin)

  return addVectors(offsetPosition, directionTransformVector)
}))

const groupColor = useGroupColor('buffer', toRef(props.buffer, 'id'))

function eventPropagationTest() {
  alert(`BUFFER CLICKED ${props.buffer.logicalId}`)
}
</script>


<template>
  <svg class="overflow-visible cursor-pointer" :x="position.x" :y="position.y">
    <use v-show="groupColor" href="#buffer-group-shadow" :fill="groupColor" />
    <use href="#buffer" @click="eventPropagationTest()" />
    <RasterizedText class="invert" y="70" :text="props.buffer.logicalId" />
  </svg>
</template>