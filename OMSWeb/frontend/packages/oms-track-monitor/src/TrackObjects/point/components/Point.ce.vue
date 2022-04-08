<script setup lang="ts">
import { Point } from '../types/Point'

const props = defineProps<{
  point: Point
  handleLeftClick: (event: MouseEvent) => void
  handleRightClick: (event: MouseEvent) => void
  handleMouseover: (event: MouseEvent) => void
  handleMouseleave: (event: MouseEvent) => void
}>()
</script>

<template>
  <svg
    class="overflow-visible cursor-pointer point"
    :x="props.point.x"
    :y="props.point.y"
  >
    <g class="scale-and-reverse-rotate">
      <circle v-if="props.point.isFocused" r="15" class="focus" />
      <circle
        r="3"
        class="point-path"
        :data-id="props.point.id"
        @click.left="handleLeftClick"
        @click.right="handleRightClick"
        @mouseover="handleMouseover"
        @mouseout="handleMouseleave"
        @mouseleave="handleMouseleave"
      />
      <text
        class="invert label select-none"
        x="0"
        y="10"
        alignment-baseline="hanging"
        text-anchor="middle"
        text-rendering="optimizeSpeed"
        font-size="0.9em"
        pointer-events="none"
      >
        {{ props.point.logicalId }}
      </text>
    </g>
  </svg>
</template>
