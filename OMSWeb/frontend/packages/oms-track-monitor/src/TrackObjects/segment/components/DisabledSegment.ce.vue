<script setup lang="ts">
import { getAngleFromTwoPoints } from 'src/utils/angle'
import { createPathElement } from 'src/utils/svg/path'
import { computed } from 'vue'
import { findSegmentById } from '../segments'
import { SegmentDisabled } from '../types/SegmentDisabled'

const props = defineProps<{
  segmentDisabled: SegmentDisabled
  handleLeftClick: (event: MouseEvent) => void
  handleRightClick: (event: MouseEvent) => void
  handleMouseover: (event: MouseEvent) => void
  handleMouseleave: (event: MouseEvent) => void
}>()

const segment = computed(() =>
  findSegmentById(props.segmentDisabled.segmentId)
)

const direction = computed(() => {
  if (segment.value === undefined) return

  const pathElement = createPathElement(segment.value.d)

  const halfLength = pathElement.getTotalLength() / 2
  const position = pathElement.getPointAtLength(halfLength)

  const forwardPosition = pathElement.getPointAtLength(halfLength + 40)
  const backwardPosition = pathElement.getPointAtLength(halfLength - 40)
  const angle = getAngleFromTwoPoints(backwardPosition, forwardPosition)

  return { position, angle }
})

</script>

<template>
  <svg
    v-if="segment"
    class="overflow-visible cursor-pointer segment"
    :data-is-disabled-by-mtl="segment.disabledByMtl"
    :data-is-disabled-by-vehicle="!segment.disabledByUser&&segment.disabledByOnlyVehicle"
  >
    <path
      v-if="segment.isFocused"
      class="focus fixed-scale-stroke"
      :d="segment.d"
      fill="none"
    />
    <path
      ref="pathElement"
      class="segment-path fixed-scale-stroke"
      :d="segment.d"
      fill="none"
      :data-segment-id="segment.id"
      @click.left="handleLeftClick"
      @click.right="handleRightClick"
      @mouseover="handleMouseover"
      @mouseout="handleMouseleave"
      @mouseleave="handleMouseleave"
    />
    <use
      v-if="direction"
      class="segment-direction"
      href="#segment-direction-triangle"
      :x="direction.position.x"
      :y="direction.position.y"
      :transform="`rotate(${direction.angle} ${direction.position.x} ${direction.position.y})`"
      :data-segment-id="segment.id"
      @click.left="handleLeftClick"
      @click.right="handleRightClick"
      @mouseover="handleMouseover"
      @mouseout="handleMouseleave"
      @mouseleave="handleMouseleave"
    />
  </svg>
</template>
