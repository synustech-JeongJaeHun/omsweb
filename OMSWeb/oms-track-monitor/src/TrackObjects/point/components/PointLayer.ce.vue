<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import Point from './Point.ce.vue'
import { findPointById, points } from '../points'
import { inject } from 'vue'
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits'

const emit = inject<RootEmits>(RootEmitInjectionKey)!

function getDeepCopiedPoint(event: MouseEvent) {
  const pointId = parseInt((event.target as SVGElement).dataset.id!)
  const point = findPointById(pointId)!
  return { ...point }
}

function handleMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'POINT',
    value: getDeepCopiedPoint(event),
    event,
  })
}
function handleMouseleave(event: MouseEvent) {
  emit('mouseleaveOnObject')
}
function handleLeftClick(event: MouseEvent) {
  emit('mainClickOnObject', {
    type: 'POINT',
    value: getDeepCopiedPoint(event),
  })
}
function handleRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'POINT',
    value: getDeepCopiedPoint(event),
    event,
  })
}
</script>

<template>
  <Layer id="point-layer">
    <Point
      v-for="point of points"
      :key="point.id"
      :point="point"
      :handleMouseover="handleMouseover"
      :handleMouseleave="handleMouseleave"
      :handleLeftClick="handleLeftClick"
      :handleRightClick="handleRightClick"
    />
  </Layer>
</template>
