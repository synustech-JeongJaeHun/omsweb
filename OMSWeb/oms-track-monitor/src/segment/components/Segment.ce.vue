<script setup lang="ts">
import { Segment } from '../types/Segment'
import { computed, inject, readonly, ref, toRef, watchEffect } from 'vue';
import { RootEmitInjectionKey, RootEmits } from '../../types/RootEmits';
import { deepCopy } from '../../utils/deepCopy';
import { useScreenFixedScale } from '../../scale/scale';
import { getAngleFromTwoPoints } from '../../utils/angle';
import { scaleStylesInfo } from '../../styles/styles'

const props = defineProps<{
  segment: Segment
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const pathElement = ref<SVGPathElement>()

const threshold = 20
const width = useScreenFixedScale(toRef(scaleStylesInfo, 'segmentWidth'), threshold)

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

function onTooltipOn() {
  emit('tooltipon', {
    type: 'Segment',
    value: deepCopy(props.segment)
  })
}
function onTooltipOff() {
  emit('tooltipoff')
}
function onContextmenu() {
  emit('contextmenuon', {
    type: "Segment",
    value: deepCopy(props.segment)
  })
}
</script>

<template>
  <svg
    class="overflow-visible cursor-pointer segment"
    :data-is-disabled="props.segment.disabled"
    @click.right="onContextmenu()"
    @mouseover="onTooltipOn()"
    @mouseout="onTooltipOff()"
    @mouseleave="onTooltipOff()"
  >
    <path
      ref="pathElement"
      class="segment-path"
      :d="props.segment.d"
      fill="none"
      :stroke-width="width"
    />
    <use
      v-if="position !== undefined && angle !== undefined"
      class="segment-direction"
      href="#segment-direction-triangle"
      :x="position.x"
      :y="position.y"
      :transform="`rotate(${angle} ${position.x} ${position.y})`"
    />
  </svg>
</template>