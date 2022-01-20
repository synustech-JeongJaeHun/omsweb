<script setup lang="ts">
import { computed, inject, Ref } from 'vue'
import { addVectors, getOrthogonalVector } from '../../utils/vector';

//   |   h/2
// __|__ h/2
// w/2 w/2
const
  height = 80
// width = height

const props = defineProps<{
  segmentPathId: string
  color: string
}>()

const shadowRoot = inject<Ref<ShadowRoot>>('shadowRoot')

const arrowHeadPathD = computed(() => {
  const pathElement = shadowRoot?.value.getElementById(props.segmentPathId) as SVGPathElement | null | undefined

  if (pathElement === undefined || pathElement === null) return ``

  const halfLength = pathElement.getTotalLength() / 2

  const halfMorePoint = pathElement.getPointAtLength(halfLength + height / 2)
  const halfPoint = pathElement.getPointAtLength(halfLength)
  const halfLessPoint = pathElement.getPointAtLength(halfLength - height / 2)

  // size of reverse vector is h/2
  const reverseVector = { x: halfLessPoint.x - halfPoint.x, y: halfLessPoint.y - halfPoint.y }
  const leftPoint = addVectors(halfLessPoint, getOrthogonalVector(reverseVector, 'counterclockwise'))
  const rightPoint = addVectors(halfLessPoint, getOrthogonalVector(reverseVector, 'clockwise'))

  return `M ${halfMorePoint.x} ${halfMorePoint.y} L ${leftPoint.x} ${leftPoint.y} L ${rightPoint.x} ${rightPoint.y} Z`
})
</script>

<template>
  <path :d="arrowHeadPathD" :fill="color" :stroke="color" />
</template>