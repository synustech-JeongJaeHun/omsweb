<script setup lang="ts">
import { Segment } from '../types/Segment'
import { computed } from 'vue'
import { getAngleFromTwoPoints } from 'src/utils/angle'
import { createPathElement } from 'src/utils/svg/path'
import { existence, getDashArray } from '../segments'

const props = defineProps<{
  segment: Segment
  handleLeftClick: (event: MouseEvent) => void
  handleRightClick: (event: MouseEvent) => void
  handleMouseover: (event: MouseEvent) => void
  handleMouseleave: (event: MouseEvent) => void
}>()

const direction = computed(() => {
  const pathElement = createPathElement(props.segment.d)

  const halfLength = pathElement.getTotalLength() / 2
  const position = pathElement.getPointAtLength(halfLength)

  const forwardPosition = pathElement.getPointAtLength(halfLength + 40)
  const backwardPosition = pathElement.getPointAtLength(halfLength - 40)
  const angle = getAngleFromTwoPoints(backwardPosition, forwardPosition)

  return { position, angle }
})
</script>

<template>
  <svg class="overflow-visible cursor-pointer segment">
    <path
      v-if="props.segment.isFocused"
      class="focus fixed-scale-stroke"
      :d="props.segment.d"
      fill="none"
    />
    <g v-if="existence(props.segment.startPoint, props.segment.endPoint)==='OVER' ">
      <path
        class="line-3 fixed-scale-stroke"
        v-bind:stroke-dasharray="getDashArray(5)"
        :d="props.segment.d"
        fill="none"
      />
      <path
        class="line-2 fixed-scale-stroke"
        :d="props.segment.d"
        fill="none"
      />
      <path
        class="line fixed-scale-stroke"
        v-bind:stroke-dasharray="getDashArray(5)"
        :d="props.segment.d"
        fill="none"
      />
    </g>
    <g v-if="existence(props.segment.startPoint, props.segment.endPoint)==='UNDER'">
      <path
        class="line-3 fixed-scale-stroke"
        :d="props.segment.d"
        fill="none"
      />
      <path
        class="line-2 fixed-scale-stroke"
        :d="props.segment.d"
        fill="none"
      />
      <path
        class="line fixed-scale-stroke"
        :d="props.segment.d"
        fill="none"
      />
    </g>
    <g v-if="existence(props.segment.startPoint, props.segment.endPoint)==='SLOPE'">
      <path
        class="line-3 fixed-scale-stroke"
        :d="props.segment.d"
        v-bind:stroke-dasharray="getDashArray(props.segment.z)"
        fill="none"
      />
      <path
        class="line-2 fixed-scale-stroke"
        :d="props.segment.d"
        v-bind:stroke-dasharray="getDashArray(props.segment.z)"
        fill="none"
      />
      <path
        class="line fixed-scale-stroke"
        :d="props.segment.d"
        v-bind:stroke-dasharray="getDashArray(props.segment.z)"
        fill="none"
      />
    </g>
    
    <path
      ref="pathElement"
      class="segment-path fixed-scale-stroke"
      :d="props.segment.d"
      fill="none"
      :data-id="props.segment.id"
      @click.left="handleLeftClick"
      @click.right="handleRightClick"
      @mouseover="handleMouseover"
      @mouseout="handleMouseleave"
      @mouseleave="handleMouseleave"
    />
    <use
      class="segment-direction"
      href="#segment-direction-triangle"
      :x="direction.position.x"
      :y="direction.position.y"
      :transform="`rotate(${direction.angle} ${direction.position.x} ${direction.position.y})`"
      :data-id="props.segment.id"
      @click.left="handleLeftClick"
      @click.right="handleRightClick"
      @mouseover="handleMouseover"
      @mouseout="handleMouseleave"
      @mouseleave="handleMouseleave"
    />
  </svg>
</template>
