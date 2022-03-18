<script setup lang="ts">
import { Zcu } from '../types/Zcu'
import { inject } from 'vue'
import { getHumanReadableUsingType } from '../utils/readable'
import { RootEmitInjectionKey, RootEmits } from '../../../types/RootEmits'
import { deepCopy } from '../../../utils/deepCopy'

const props = defineProps<{
  zcu: Zcu
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

function onMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'ZCU',
    value: deepCopy(props.zcu),
    event,
  })
}
function onMouseleave() {
  emit('mouseleaveOnObject')
}
function onLeftClick() {
  emit('mainClickOnObject', {
    type: 'ZCU',
    value: deepCopy(props.zcu),
  })
}
function onRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'ZCU',
    value: deepCopy(props.zcu),
    event,
  })
}
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
        @click.left="onLeftClick()"
        @click.right="onRightClick($event)"
        @mouseover="onMouseover($event)"
        @mouseout="onMouseleave()"
        @mouseleave="onMouseleave()"
      />
      <text
        class="invert label select-none"
        x="-15"
        y="-3"
        text-anchor="end"
        alignment-baseline="baseline"
        text-rendering="optimizeSpeed"
        font-size="0.9em"
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
        font-size="0.9em"
        pointer-events="none"
      >
        {{ String(props.zcu.id) }}
      </text>
      <!-- </MapReverseRotate>
    </ScaleByScale> -->
    </g>
  </svg>
</template>
