<script setup lang="ts">
import { computed, ref } from 'vue'
import { addVectors, getOrthogonalVector } from '../../utils/vector';

//   |   h/2
// __|__ h/2
// w/2 w/2
const
  height = 80
// width = height

const props = defineProps<{
  segmentPathId: string
}>()

const selfElement = ref<SVGElement>()

const arrowHeadPathD = computed(() => {
  const shadowRoot = selfElement.value?.getRootNode() as ShadowRoot | undefined
  const path = shadowRoot?.getElementById(props.segmentPathId) as SVGPathElement | null | undefined

  if (path === undefined || path === null) return ``

  const halfLength = path.getTotalLength() / 2

  const halfMorePoint = path.getPointAtLength(halfLength + height / 2)
  const halfPoint = path.getPointAtLength(halfLength)
  const halfLessPoint = path.getPointAtLength(halfLength - height / 2)

  // size of reverse vector is h/2
  const reverseVector = { x: halfLessPoint.x - halfPoint.x, y: halfLessPoint.y - halfPoint.y }
  const leftPoint = addVectors(halfLessPoint, getOrthogonalVector(reverseVector, 'counterclockwise'))
  const rightPoint = addVectors(halfLessPoint, getOrthogonalVector(reverseVector, 'clockwise'))

  return `M ${halfMorePoint.x} ${halfMorePoint.y} L ${leftPoint.x} ${leftPoint.y} L ${rightPoint.x} ${rightPoint.y} Z`
})
</script>

<template>
  <path ref="selfElement" :d="arrowHeadPathD" fill="grey" stroke="grey" />
</template>