<script setup lang="ts">
import { computed, readonly } from 'vue'
import { findPointById } from '../../point/points'
import { addVectors, getOrthogonalVector, getUnitVector, multipleVector, ZeroVector } from '../../utils/vector'
import { Buffer } from '../types/Buffer'

const BufferDirectionMargin = 500

const props = defineProps<{
  buffer: Buffer
}>()

const startPoint = readonly(computed(() => findPointById(props.buffer.pointId)))
const endPoint = readonly(computed(() => findPointById(props.buffer.nextPoint)))
const position = readonly(computed(() => {
  if (startPoint.value === undefined || endPoint.value === undefined)
    return { x: 0, y: 0 }

  const unitVector = getUnitVector({
    x: endPoint.value.x - startPoint.value.x,
    y: endPoint.value.y - startPoint.value.y
  })

  const offsetVector = multipleVector(unitVector, props.buffer.offset)
  const offsetPosition = addVectors({ x: startPoint.value.x, y: startPoint.value.y }, offsetVector)

  const orthogonalVector =
    props.buffer.direction === 'L' ? getOrthogonalVector(unitVector, 'counterclockwise')
      : props.buffer.direction === 'R' ? getOrthogonalVector(unitVector, 'clockwise')
        : ZeroVector
  const directionTransformVector = multipleVector(orthogonalVector, BufferDirectionMargin)

  return addVectors(offsetPosition, directionTransformVector)
}))
</script>

<template>
  <svg :x="position.x" :y="position.y" style="overflow: visible;">
    <!-- <circle r="50" stroke="black" stroke-width="10" fill="none" /> -->
    <use href="#buffer" />
    <!-- <text y="70">{{ props.buffer.logicalId }}</text> -->
  </svg>
</template>