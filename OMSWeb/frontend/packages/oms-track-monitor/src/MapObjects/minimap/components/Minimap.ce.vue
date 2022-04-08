<script setup lang="ts">
import { segments } from 'src/TrackObjects/segment/segments'
import { mapSizePropertiesInfo } from 'MapObjects/map/mapSizeProperties'
import { computed, readonly, ref } from 'vue'
import {
  moveCamera,
  enterPanning,
  exitPanning,
  isPanning,
} from 'MapObjects/map/camera'
import SegmentOnlyStroke from './SegmentOnlyStroke.ce.vue'
import MapRotate from 'MapObjects/rotate/components/MapRotate.ce.vue'
import { centerZoom } from 'src/MapObjects/cameraAndRotation'
import CameraBox from './CameraBox.ce.vue'

const MapMargin = 10000

const baseLength = readonly(
  computed(() =>
    Math.max(
      mapSizePropertiesInfo.value.width,
      mapSizePropertiesInfo.value.height,
      (mapSizePropertiesInfo.value.width +
        mapSizePropertiesInfo.value.height) /
        Math.pow(8, 1 / 2)
    )
  )
)
const originPosition = readonly(
  computed(() => ({
    x:
      mapSizePropertiesInfo.value.centerX -
      baseLength.value / 2 -
      MapMargin,
    y:
      mapSizePropertiesInfo.value.centerY -
      baseLength.value / 2 -
      MapMargin,
  }))
)

const minimapViewBoxLength = readonly(
  computed(() => baseLength.value + 2 * MapMargin)
)

const minimapSvgElement = ref<SVGElement>()

function onPanning(event: MouseEvent) {
  if (minimapSvgElement.value === undefined) return

  const rect = minimapSvgElement.value.getBoundingClientRect()
  const minimapDomRect = {
    width: rect.width,
    height: rect.height,
    minX: rect.x,
    minY: rect.y,
    maxX: rect.x + rect.width,
    maxY: rect.y + rect.height,
  }

  const position = {
    x:
      ((event.clientX - minimapDomRect.minX) / minimapDomRect.width) *
        minimapViewBoxLength.value -
      MapMargin,
    // 📐🛑 Be careful! logic is dependent on invert
    y:
      ((minimapDomRect.maxY - event.clientY) / minimapDomRect.height) *
        minimapViewBoxLength.value -
      MapMargin,
  }
  moveCamera(position)
}
</script>

<template>
  <svg
    id="minimap-container"
    class="invert"
    ref="minimapSvgElement"
    :viewBox="`${originPosition.x} ${originPosition.y} ${minimapViewBoxLength} ${minimapViewBoxLength}`"
    :style="{
      maxWidth: `20vw`,
      maxHeight: `20vh`,
      backgroundColor: 'white',
      border: '2px solid black',
    }"
    @mousedown="enterPanning(), onPanning($event)"
    @mousemove="isPanning && onPanning($event)"
    @mouseup="exitPanning()"
    @mouseleave="exitPanning()"
    @click.middle.prevent="centerZoom()"
    @mousedown.middle.prevent
    @click.right.prevent
  >
    <MapRotate>
      <SegmentOnlyStroke
        v-for="segment of segments"
        :key="segment.id"
        :segment="segment"
      />
    </MapRotate>
    <CameraBox />
  </svg>
</template>
