<script setup lang="ts">
import { Point } from '../types/Point'
import { inject } from 'vue'
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits'
import { deepCopy } from 'src/utils/deepCopy'

const props = defineProps<{
  point: Point
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

function onMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'POINT',
    value: deepCopy(props.point),
    event,
  })
}
function onMouseleave() {
  emit('mouseleaveOnObject')
}
function onLeftClick() {
  emit('mainClickOnObject', {
    type: 'POINT',
    value: deepCopy(props.point),
  })
}
function onRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'POINT',
    value: deepCopy(props.point),
    event,
  })
}
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
        r="5"
        class="point-path"
        @click.left="onLeftClick()"
        @click.right="onRightClick($event)"
        @mouseover="onMouseover($event)"
        @mouseout="onMouseleave()"
        @mouseleave="onMouseleave()"
      />
      <text
        class="invert label select-none"
        x="10"
        y="0"
        alignment-baseline="hanging"
        text-rendering="optimizeSpeed"
        font-size="0.9em"
        pointer-events="none"
      >
        {{ props.point.logicalId }}
      </text>
    </g>
  </svg>
</template>
