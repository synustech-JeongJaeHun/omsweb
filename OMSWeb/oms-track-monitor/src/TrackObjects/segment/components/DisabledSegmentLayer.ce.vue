<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import { segmentDisableds } from '../segmentDisableds'
import { scaleStylesInfo } from 'src/styles/styles'
import DisabledSegment from './DisabledSegment.ce.vue'
import { findSegmentById } from '../segments'
import { deepCopy } from 'src/utils/deepCopy'
import { inject } from 'vue'
import { RootEmitInjectionKey, RootEmits } from 'src/Root/types/RootEmits'

const emit = inject<RootEmits>(RootEmitInjectionKey)!

function getDeepCopiedSegment(event: MouseEvent) {
  const segmentId = parseInt(
    (event.target as SVGElement).dataset.segmentId!
  )
  const segment = findSegmentById(segmentId)!
  return deepCopy(segment)
}

function handleMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'SEGMENT',
    value: getDeepCopiedSegment(event),
    event,
  })
}
function handleMouseleave(event: MouseEvent) {
  emit('mouseleaveOnObject')
}
function handleLeftClick(event: MouseEvent) {
  emit('mainClickOnObject', {
    type: 'SEGMENT',
    value: getDeepCopiedSegment(event),
  })
}
function handleRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'SEGMENT',
    value: getDeepCopiedSegment(event),
    event,
  })
}
</script>

<template>
  <Layer id="disabled-segment-layer">
    <defs>
      <path
        id="segment-direction-triangle"
        class="fixed-scale-stroke"
        :stroke-width="scaleStylesInfo.segmentDirection"
        :d="`M 0 5` + `L -5 -5` + `L 5 -5` + `Z`"
      />
    </defs>
    <DisabledSegment
      v-for="segmentDisabled of segmentDisableds"
      :key="segmentDisabled.id"
      :segmentDisabled="segmentDisabled"
      :handleMouseover="handleMouseover"
      :handleMouseleave="handleMouseleave"
      :handleLeftClick="handleLeftClick"
      :handleRightClick="handleRightClick"
    />
  </Layer>
</template>
