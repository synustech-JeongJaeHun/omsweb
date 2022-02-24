<script setup lang="ts">
import { segments } from '../../segment/segments';
import { mapSizePropertiesInfo } from '../../map/mapSizeProperties';
import CameraBox from './CameraBox.ce.vue';
import { computed, reactive, readonly, ref, toRef, watch } from 'vue';
import { moveCamera, zoomInOutByWheel, enterPanning, exitPanning, isPanning } from '../../map/camera';
import SegmentOnlyStroke from './SegmentOnlyStroke.ce.vue';
import MapRotate from '../../rotate/components/MapRotate.ce.vue';
import { elementRectInfo } from '../../map/elementRect';
import { visibleStylesInfo } from '../../styles/styles'
import { centerZoom } from '../../cameraAndRotation';

const MapMargin = 10000

const isMinimapVisible = toRef(visibleStylesInfo, 'minimap')
const baseLength = readonly(computed(() =>
  Math.max(
    mapSizePropertiesInfo.value.width,
    mapSizePropertiesInfo.value.height,
    (mapSizePropertiesInfo.value.width + mapSizePropertiesInfo.value.height) / Math.pow(8, 1 / 2),
  )
))
const originPosition = readonly(computed(() => ({
  x: mapSizePropertiesInfo.value.centerX - baseLength.value / 2 - MapMargin,
  y: mapSizePropertiesInfo.value.centerY - baseLength.value / 2 - MapMargin,
})))

const minimapViewBoxLength = readonly(computed(() => baseLength.value + 2 * MapMargin))

const minimapSvgElement = ref<SVGElement>()
const minimapDomRect = reactive({ width: 0, height: 0, minX: 0, minY: 0, maxX: 0, maxY: 0 })

watch([minimapSvgElement, elementRectInfo], () => {
  // use setTimeout for unexpected domrect value (like negative y)
  setTimeout(() => {
    if (minimapSvgElement.value === undefined) return

    // https://developer.mozilla.org/ko/docs/Web/API/Element/getBoundingClientRect
    const rect = minimapSvgElement.value.getBoundingClientRect()

    minimapDomRect.width = rect.width
    minimapDomRect.height = rect.height
    minimapDomRect.minX = rect.x
    minimapDomRect.minY = rect.y
    minimapDomRect.maxX = rect.x + rect.width
    minimapDomRect.maxY = rect.y + rect.height
  }, 0);
})

function onPanning(event: MouseEvent) {
  // if (minimapDomRect.width === 0 || minimapDomRect.height === 0) return

  const position = {
    x: (event.clientX - minimapDomRect.minX) / minimapDomRect.width * minimapViewBoxLength.value - MapMargin,
    // 📐🛑 Be careful! logic is dependent on invert
    y: (minimapDomRect.maxY - event.clientY) / minimapDomRect.height * minimapViewBoxLength.value - MapMargin
  }
  moveCamera(position)
}

</script>

<template>
  <svg
    id="minimap-container"
    v-show="isMinimapVisible"
    class="invert"
    ref="minimapSvgElement"
    :viewBox="`${originPosition.x} ${originPosition.y} ${minimapViewBoxLength} ${minimapViewBoxLength}`"
    :style="{
      maxWidth: `20vw`,
      maxHeight: `20vh`,
      backgroundColor: 'white',
      border: '2px solid black'
    }"
    @wheel="zoomInOutByWheel($event)"
    @mousedown="enterPanning(), onPanning($event)"
    @mousemove="isPanning && onPanning($event)"
    @mouseup="exitPanning()"
    @mouseleave="exitPanning()"
    @click.middle.prevent="centerZoom()"
    @mousedown.middle.prevent
    @click.right.prevent
  >
    <MapRotate>
      <SegmentOnlyStroke v-for="segment of segments" :key="segment.id" :segment="segment" />
    </MapRotate>
    <CameraBox />
  </svg>
</template>