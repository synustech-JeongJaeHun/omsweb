<script setup lang="ts">
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits'
import { getAngleFromTwoPoints } from 'src/utils/angle'
import { deepCopy } from 'src/utils/deepCopy'
import { computed, inject, ref, watch } from 'vue'
import { findSegmentById } from '../segments'
import { SegmentDisabled } from '../types/SegmentDisabled'

const props = defineProps<{
  segmentDisabled: SegmentDisabled
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const segment = computed(() =>
  findSegmentById(props.segmentDisabled.segmentId)
)

const pathElement = ref<SVGPathElement>()

const position = ref<DOMPoint>()
const angle = ref<number>()

watch(pathElement, (pathElement) => {
  if (pathElement) {
    const halfLength = pathElement.getTotalLength() / 2
    const halfPosition = pathElement.getPointAtLength(halfLength)
    position.value = halfPosition

    const forwardPosition = pathElement.getPointAtLength(halfLength + 40)
    const backwardPosition = pathElement.getPointAtLength(halfLength - 40)
    angle.value = getAngleFromTwoPoints(backwardPosition, forwardPosition)
  }
})

function onMouseover(event: MouseEvent) {
  if (segment.value)
    emit('mouseoverOnObject', {
      type: 'SEGMENT',
      value: deepCopy(segment.value),
      event,
    })
}
function onMouseleave() {
  if (segment.value) emit('mouseleaveOnObject')
}
function onLeftClick() {
  if (segment.value)
    emit('mainClickOnObject', {
      type: 'SEGMENT',
      value: deepCopy(segment.value),
    })
}
function onRightClick(event: MouseEvent) {
  if (segment.value)
    emit('secondaryClickOnObject', {
      type: 'SEGMENT',
      value: deepCopy(segment.value),
      event,
    })
}
</script>

<template>
  <svg
    v-if="segment"
    class="overflow-visible cursor-pointer segment"
    :data-is-disabled-by-mtl="segment.disabledByMtl"
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
