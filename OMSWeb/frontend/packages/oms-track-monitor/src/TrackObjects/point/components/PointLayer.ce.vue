<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import Point from './Point.ce.vue'
import { findPointById, points } from '../points'
import { inject } from 'vue'
import { RootEmitInjectionKey, RootEmits } from 'src/Root/types/RootEmits'

const emit = inject<RootEmits>(RootEmitInjectionKey)!

function getDeepCopiedPoint(event: MouseEvent) {
  const pointId = parseInt((event.currentTarget as SVGElement).dataset.id!)
  const groupId = parseInt(
    (event.currentTarget as SVGElement).dataset.groupId ?? ''
  )
  const point = findPointById(pointId)!
  return { ...point, groupId: Number.isNaN(groupId) ? undefined : groupId }
}

function handleMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'POINT',
    value: getDeepCopiedPoint(event),
    event,
  })
}
let clientX: number
let clientY: number
function handleMouseleave(event: MouseEvent) {
  if(clientX !== event.clientX || clientY !== event.clientY){
    emit('mouseleaveOnObject')
    clientX = event.clientX
    clientY = event.clientY
  }
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
