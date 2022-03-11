<script setup lang="ts">
import { Segment } from '../types/Segment'
import { inject, ref, watchEffect } from 'vue';
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits';
import { getAngleFromTwoPoints } from 'src/utils/angle';
import { deepCopy } from 'src/utils/deepCopy';

const props = defineProps<{
  segment: Segment
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const pathElement = ref<SVGPathElement>()

const position = ref<DOMPoint>()
const angle = ref<number>()
watchEffect(() => {
  if (pathElement.value) {
    const halfLength = pathElement.value.getTotalLength() / 2
    const halfPosition = pathElement.value.getPointAtLength(halfLength)
    position.value = halfPosition

    const forwardPosition = pathElement.value.getPointAtLength(halfLength + 40)
    const backwardPosition = pathElement.value.getPointAtLength(halfLength - 40)
    angle.value = getAngleFromTwoPoints(backwardPosition, forwardPosition)
  }
})

function onMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: "SEGMENT",
    value: deepCopy(props.segment),
    event
  })
}
function onMouseleave() {
  emit('mouseleaveOnObject')
}
function onLeftClick() {
  emit('mainClickOnObject', {
    type: "SEGMENT",
    value: deepCopy(props.segment)
  })
}
function onRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: "SEGMENT",
    value: deepCopy(props.segment),
    event
  })
}
</script>

<template>
  <svg class="overflow-visible cursor-pointer segment" :data-is-disabled="props.segment.disabled">
    <path
      v-if="props.segment.isFocused"
      class="focus fixed-scale-stroke"
      :d="props.segment.d"
      fill="none"
    />
    <path
      ref="pathElement"
      class="segment-path fixed-scale-stroke"
      :d="props.segment.d"
      fill="none"
      @click.left="onLeftClick()"
      @click.right="onRightClick($event)"
      @mouseover="onMouseover($event)"
      @mouseout="onMouseleave()"
      @mouseleave="onMouseleave()"
    />
    <use
      v-if="position !== undefined && angle !== undefined"
      class="segment-direction"
      href="#segment-direction-triangle"
      :x="position.x"
      :y="position.y"
      :transform="`rotate(${angle} ${position.x} ${position.y})`"
      @click.right="onRightClick($event)"
      @mouseover="onMouseover($event)"
      @mouseout="onMouseleave()"
      @mouseleave="onMouseleave()"
    />
  </svg>
</template>