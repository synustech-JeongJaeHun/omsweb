<script setup lang="ts">
import { inject, ref, toRef } from 'vue';
import { pan, zoom } from '../camera';
import { centerZoom } from '../../cameraAndRotation';
import GridLayer from './GridLayer.ce.vue';
import PointLayer from '../../point/components/PointLayer.ce.vue';
import BufferLayer from '../../buffer/components/BufferLayer.ce.vue';
import StationLayer from '../../station/components/StationLayer.ce.vue';
import ZcuLayer from '../../zcu/components/ZcuLayer.ce.vue';
import MtlLayer from '../../mtl/components/MtlLayer.ce.vue';
import VehicleLayer from '../../vehicle/components/VehicleLayer.ce.vue';
import SegmentLayer from '../../segment/components/SegmentLayer.ce.vue';
import ClusterLayer from '../../cluster/components/ClusterLayer.ce.vue';

import { elementRectInfo } from '../elementRect';
import { rotate, rotationInfo } from '../../rotate/rotate';
import { RootEmitInjectionKey, RootEmits } from '../../types/RootEmits';
import { visibleStylesInfo } from '../../styles/styles';

const emit = inject<RootEmits>(RootEmitInjectionKey)!

const isGroupVisible = toRef(visibleStylesInfo, 'group')

let touches: Touch[] = []

const
  isPanning = ref(false),
  hasPanned = ref(false)

function enterPanning() {
  isPanning.value = true
}
function exitPanning() {
  isPanning.value = false
}
function panByMouse(event: MouseEvent) {
  // 📐🛑 Be careful! logic is dependent on invert
  pan(event.movementX, (-1) * event.movementY)
  hasPanned.value = true
}
function panByTouch(event: TouchEvent) {
  // console.log('touchevent', event)
  // pan(event.movementX, (-1) * event.movementY) no movement in touchevent
  hasPanned.value = true
}

const
  isRotating = ref(false),
  hasRotated = ref(false)

function enterRotating() {
  isRotating.value = true
}
function exitRotating() {
  isRotating.value = false
  hasRotated.value = false
}
function rotateToByMouse(event: MouseEvent) {
  if (Math.abs(event.movementX) > 3) {
    // 📐🛑 Be careful! logic is dependent on invert
    const
      movementX = event.movementX,
      movementY = event.movementY * (-1)

    const direction = (function () {
      const
        absX = Math.abs(movementX),
        absY = Math.abs(movementY)

      if (absX > absY && movementX > 0) return "Right"
      if (absX > absY && movementX < 0) return "Left"
    })()

    if (direction === 'Left')
      rotate((rotationInfo.value + 15) % 360)
    else if (direction === 'Right')
      rotate((rotationInfo.value + 345) % 360)

    hasRotated.value = true
  }
}

// WheelEvent
// https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaY
// scrollToForward: deltaY < 0 
// scrollToBackward: deltaY > 0
function zoomInOut(event: WheelEvent | MouseEvent) {
  const action = (event instanceof WheelEvent) && (event.deltaY > 0) ? 'Out' : 'In'
  zoom(action, { x: event.clientX, y: event.clientY })
}

function handleMouseUp() {
  if (hasPanned.value === false
    && hasRotated.value === false)
    emit('backdrop')

  hasPanned.value = false
  hasRotated.value = false
}
</script>

  <!-- TODO -->
  <!-- touch need 
  1)pan
  2)zoom
  3)rotate
  4)focus
  5)backdrop

  @touchstart="enterPanning()"
  @touchstart.right.prevent
  @touchend="exitPanning()"
  @touchcancel="exitPanning()" -->

<template>
  <svg
    id="layer-container"
    class="invert"
    :width="elementRectInfo.width"
    :height="elementRectInfo.height"
    :viewBox="`0 0 ${elementRectInfo.width} ${elementRectInfo.height}`"
    :data-is-panning="isPanning"
    :data-is-rotating="isRotating"
    :data-is-group-visible="isGroupVisible"
    @wheel="zoomInOut($event)"
    @dblclick.self="zoomInOut($event)"
    @mousedown.left="enterPanning()"
    @mousedown.right="enterRotating()"
    @mousemove="isPanning && panByMouse($event), isRotating && rotateToByMouse($event)"
    @touchmove="isPanning && panByTouch($event)"
    @mouseleave="exitPanning(), exitRotating()"
    @mouseup="exitPanning(), exitRotating()"
    @click.left.self="handleMouseUp()"
    @click.middle.prevent="centerZoom()"
    @click.right.prevent
  >
    <GridLayer />
    <ClusterLayer />
    <SegmentLayer />
    <PointLayer />
    <BufferLayer />
    <StationLayer />
    <ZcuLayer />
    <MtlLayer />
    <VehicleLayer />
  </svg>
</template>