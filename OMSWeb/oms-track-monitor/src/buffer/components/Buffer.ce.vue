<script setup lang="ts">
import { computed, inject, readonly, toRef } from 'vue'
import { usePointPoisiton } from '../../point/points'
import { addVectors, getOrthogonalVector, getUnitVector, multipleVector, ZeroVector } from '../../utils/vector'
import { Buffer } from '../types/Buffer'
import RasterizedText from '../../map/components/RasterizedText.ce.vue'
import { useGroupColor } from '../../group/groups'
import { RootEmitInjectionKey, RootEmits } from '../../types/RootEmits'
import { deepCopy } from '../../utils/deepCopy'
import MapReverseRotate from '../../rotate/components/MapReverseRotate.ce.vue'

const BufferDirectionMargin = 500

const props = defineProps<{
  buffer: Buffer
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const startPointPosition = usePointPoisiton(toRef(props.buffer, 'pointId'))
const nextPointPosition = usePointPoisiton(toRef(props.buffer, 'nextPoint'))
const position = readonly(computed(() => {
  if (startPointPosition.value === undefined || nextPointPosition.value === undefined)
    return { x: 0, y: 0 }

  const unitVector = getUnitVector({
    x: nextPointPosition.value.x - startPointPosition.value.x,
    y: nextPointPosition.value.y - startPointPosition.value.y
  })

  const offsetVector = multipleVector(unitVector, props.buffer.offset)
  const offsetPosition = addVectors({ x: startPointPosition.value.x, y: startPointPosition.value.y }, offsetVector)

  const orthogonalVector =
    props.buffer.direction === 'L' ? getOrthogonalVector(unitVector, 'counterclockwise')
      : props.buffer.direction === 'R' ? getOrthogonalVector(unitVector, 'clockwise')
        : ZeroVector
  const directionTransformVector = multipleVector(orthogonalVector, BufferDirectionMargin)

  const position = addVectors(offsetPosition, directionTransformVector)
  return { x: Math.ceil(position.x), y: Math.ceil(position.y) }
}))

const groupColor = useGroupColor('buffer', toRef(props.buffer, 'id'))

function onTooltipOn() {
  emit('tooltipon', {
    type: 'Buffer',
    value: deepCopy(props.buffer)
  })
}
function onTooltipOff() {
  emit('tooltipoff')
}
function onFocus() {
  emit('focus', {
    type: "Buffer",
    value: deepCopy(props.buffer)
  })
}
function onContextmenu() {
  emit('contextmenuon', {
    type: "Buffer",
    value: deepCopy(props.buffer)
  })
}
</script>


<template>
  <svg class="overflow-visible cursor-pointer" :x="position.x" :y="position.y">
    <use v-show="groupColor" href="#buffer-group-shadow" :fill="groupColor" />
    <use
      href="#buffer"
      stroke="black"
      stroke-width="15"
      @click.left="onFocus()"
      @click.right="onContextmenu()"
      @mouseover="onTooltipOn()"
      @mouseout="onTooltipOff()"
      @mouseleave="onTooltipOff()"
    />
    <!-- <text y="70">{{ props.buffer.logicalId }}</text> -->
    <MapReverseRotate>
      <RasterizedText class="invert" x="75" y="45" :text="props.buffer.logicalId" />
    </MapReverseRotate>
  </svg>
</template>