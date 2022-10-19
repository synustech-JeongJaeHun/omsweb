<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import Segment from './Segment.ce.vue'
import { findSegmentById, segments } from '../segments'
import { findSegmentDisabledsBySegmentId } from '../segmentDisableds'
import { scaleStylesInfo } from 'src/styles/styles'
import { inject } from 'vue'
import { RootEmitInjectionKey, RootEmits } from 'src/Root/types/RootEmits'
import { deepCopy } from 'src/utils/deepCopy'

const emit = inject<RootEmits>(RootEmitInjectionKey)!

function getDeepCopiedSegment(event: MouseEvent) {
  const segmentId = parseInt((event.target as SVGElement).dataset.id!)
  const segment = findSegmentById(segmentId)!
  const segmentDisableds = findSegmentDisabledsBySegmentId(segmentId)
  return deepCopy({...segment, disableds: segmentDisableds })
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
  <Layer id="segment-layer">
    <defs>
      <path
        id="segment-direction-triangle"
        class="fixed-scale-stroke"
        :stroke-width="scaleStylesInfo.segmentDirection"
        :d="`M 0 5` + `L -5 -5` + `L 5 -5` + `Z`"
      />
    </defs>
    <Segment
      v-for="segment of segments"
      :key="segment.id"
      :segment="segment"
      :handleMouseover="handleMouseover"
      :handleMouseleave="handleMouseleave"
      :handleLeftClick="handleLeftClick"
      :handleRightClick="handleRightClick"
    />
  </Layer>
</template>
