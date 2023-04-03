<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import Station from './Station.ce.vue'
import { findStationById, stations } from '../stations'
import { inject, ref } from 'vue'
import { RootEmitInjectionKey, RootEmits } from 'src/Root/types/RootEmits'
import { scaleStylesInfo } from '../../../styles/styles'

const emit = inject<RootEmits>(RootEmitInjectionKey)!
const teleportRef = ref<SVGGElement>()

function getDeepCopiedStation(event: MouseEvent) {
  const stationId = parseInt((event.target as SVGElement).dataset.id!)
  const station = findStationById(stationId)!
  return { ...station }
}

function handleMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'STATION',
    value: getDeepCopiedStation(event),
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
    type: 'STATION',
    value: getDeepCopiedStation(event),
  })
}
function handleRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'STATION',
    value: getDeepCopiedStation(event),
    event,
  })
}
</script>

<template>
  <Layer id="station-layer">
    <defs>
      <!-- 
        pointer-events for event from bounding-box
        https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pointer-events
      -->
      <path
        id="station"
        pointer-events="bounding-box"
        fill="none"
        d="
        M 3 10
        L 10 10
        L 10 3
        M 10 -3
        L 10 -10
        L 3 -10
        M -3 -10
        L -10 -10
        L -10 -3
        M -10 3
        L -10 10
        L -3 10"
      />
      <rect
        id="station-group-shadow"
        x="-16"
        y="-16"
        width="32"
        height="32"
      />
    </defs>

    <Station
      v-for="station of stations"
      :key="station.id"
      :station="station"
      :teleportRef="teleportRef"
      :margin="scaleStylesInfo.stationMargin"
      :handleMouseover="handleMouseover"
      :handleMouseleave="handleMouseleave"
      :handleLeftClick="handleLeftClick"
      :handleRightClick="handleRightClick"
    />

    <g ref="teleportRef"></g>
  </Layer>
</template>
