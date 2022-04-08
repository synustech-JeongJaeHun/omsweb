<script setup lang="ts">
import { Zcu } from '../types/Zcu'
import { getHumanReadableUsingType } from '../utils/readable'

const props = defineProps<{
  zcu: Zcu
  handleLeftClick: (event: MouseEvent) => void
  handleRightClick: (event: MouseEvent) => void
  handleMouseover: (event: MouseEvent) => void
  handleMouseleave: (event: MouseEvent) => void
}>()
</script>

<template>
  <svg
    class="overflow-visible cursor-pointer zcu"
    :x="props.zcu.x"
    :y="props.zcu.y"
  >
    <g class="scale-and-reverse-rotate">
      <!-- <ScaleByScale>
      <MapReverseRotate> -->
      <use
        v-if="props.zcu.isFocused"
        href="#zcu"
        class="focus"
        fill="none"
      />

      <!-- 
        pointer-events for event from bounding-box
        https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pointer-events
        -->
      <use
        href="#zcu"
        pointer-events="bounding-box"
        stroke="black"
        stroke-width="3"
        :fill="props.zcu.error ? 'red' : 'transparent'"
        :data-id="props.zcu.id"
        @click.left="handleLeftClick"
        @click.right="handleRightClick"
        @mouseover="handleMouseover"
        @mouseout="handleMouseleave"
        @mouseleave="handleMouseleave"
      />
      <text
        class="invert label select-none"
        x="-15"
        y="-3"
        text-anchor="end"
        alignment-baseline="baseline"
        text-rendering="optimizeSpeed"
        pointer-events="none"
      >
        {{ getHumanReadableUsingType(props.zcu.usingType) }}
      </text>
      <text
        class="invert label select-none"
        x="15"
        y="3"
        text-anchor="start"
        alignment-baseline="hanging"
        text-rendering="optimizeSpeed"
        pointer-events="none"
      >
        {{ String(props.zcu.id) }}
      </text>
      <!-- </MapReverseRotate>
    </ScaleByScale> -->
    </g>
  </svg>
</template>
