<script setup lang="ts">
import { segments } from '../../segment/segments';
import { mapSizePropertiesInfo } from '../../map/mapSizeProperties';
import CameraBox from './CameraBox.ce.vue';
import { computed, reactive, readonly, ref, watch } from 'vue';
import { cameraInfo, moveCamera } from '../../map/camera';
import SegmentOnlyStroke from './SegmentOnlyStroke.ce.vue';

const
  MapMargin = 3000,
  X = (-1) * MapMargin,
  Y = (-1) * MapMargin

const
  minimapViewBoxWidth = readonly(computed(() => mapSizePropertiesInfo.value.maxX + 2 * MapMargin)),
  minimapViewBoxHeight = readonly(computed(() => mapSizePropertiesInfo.value.maxY + 2 * MapMargin))

const minimapSvgElement = ref<SVGElement>()
const minimapDomRect = reactive({ width: 0, height: 0, minX: 0, minY: 0, maxX: 0, maxY: 0 })

watch([minimapSvgElement, cameraInfo], () => {
  if (minimapSvgElement.value === undefined) return

  const rect = minimapSvgElement.value.getBoundingClientRect()
  minimapDomRect.width = rect.width
  minimapDomRect.height = rect.height
  minimapDomRect.minX = rect.x
  minimapDomRect.minY = rect.y
  minimapDomRect.maxX = rect.x + rect.width
  minimapDomRect.maxY = rect.y + rect.height
})


const isPanning = ref(false)
function enterPanning() {
  isPanning.value = true
}
function exitPanning() {
  isPanning.value = false
}
function onPanning(event: MouseEvent) {
  if (minimapDomRect.width === 0 || minimapDomRect.height === 0) return

  const
    x = (event.clientX - minimapDomRect.minX) / minimapDomRect.width * minimapViewBoxWidth.value - MapMargin,
    y = (event.clientY - minimapDomRect.minY) / minimapDomRect.height * minimapViewBoxHeight.value - MapMargin

  moveCamera(x, y)
}

</script>

<template>
  <svg
    id="minimap-container"
    ref="minimapSvgElement"
    :viewBox="`${X} ${Y} ${minimapViewBoxWidth} ${minimapViewBoxHeight}`"
    :style="{
      maxWidth: `20vw`,
      maxHeight: `20vh`,
      backgroundColor: 'white',
      border: '2px solid black'
    }"
    @mousedown="enterPanning(), onPanning($event)"
    @mousemove="isPanning && onPanning($event)"
    @mouseup="exitPanning()"
    @mouseleave="exitPanning()"
  >
    <SegmentOnlyStroke v-for="segment of segments" :key="segment.id" :segment="segment" />
    <CameraBox />
  </svg>
</template>