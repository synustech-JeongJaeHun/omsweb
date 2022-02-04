<script setup lang="ts">
import { ref } from 'vue';
import { pan, zoom, initCamera } from '../camera';
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
import { rotateByMouse } from '../rotate';

const props = defineProps<{
  isClusterShowing: boolean,
  isGroupShowing: boolean,
}>()

// MouseEvent.button
// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
// 0: [LEFT] Main button pressed, usually the left button or the un-initialized state
// 1: [WHEEL] Auxiliary button pressed, usually the wheel button or the middle button (if present)
// 2: [RIGHT] Secondary button pressed, usually the right button
// 3: Fourth button, typically the Browser Back button
// 4: Fifth button, typically the Browser Forward button
const
  isPanning = ref(false)
// canPanning = ref(false)
function enterPanning() {
  isPanning.value = true
  // canPanning.value = true
}
function exitPanning() {
  isPanning.value = false
  // canPanning.value = false
}
function panTo(event: MouseEvent) {
  // if (canPanning.value) {
  // 📐🛑 Be careful! logic is dependent on invert
  pan(event.movementX, (-1) * event.movementY)
  // canPanning.value = false
  // setTimeout(() => { canPanning.value = true }, 50);
  // }
}

const
  isRotating = ref(false)
// canRotating = ref(false)
function enterRotating() {
  isRotating.value = true
  // canRotating.value = true
}
function exitRotating() {
  isRotating.value = false
  // canRotating.value = false
}
function rotateTo(event: MouseEvent) {
  // if (canRotating.value && Math.abs(event.movementX) > 2) {
  // 📐🛑 Be careful! logic is dependent on invert
  rotateByMouse(event.movementX, (-1) * event.movementY)
  // canRotating.value = false
  // setTimeout(() => { canRotating.value = true }, 50);
  // }
}

// WheelEvent
// https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaY
// scrollToForward: deltaY < 0 
// scrollToBackward: deltaY > 0
function zoomInOut(event: WheelEvent | MouseEvent) {
  const action = (event instanceof WheelEvent) && (event.deltaY > 0) ? 'Out' : 'In'
  zoom(action, { x: event.clientX, y: event.clientY })
}

function onLeftClick(event: MouseEvent) {
  event.clientX
  event.clientY
}
function onRightClick(event: MouseEvent) {
  event.clientX
  event.clientY
}
</script>

<template>
  <svg
    id="layer-container"
    class="invert"
    :width="elementRectInfo.width"
    :height="elementRectInfo.height"
    :viewBox="`0 0 ${elementRectInfo.width} ${elementRectInfo.height}`"
    :data-is-panning="isPanning"
    :data-is-rotating="isRotating"
    :data-is-group-showing="props.isGroupShowing"
    @wheel="zoomInOut($event)"
    @dblclick="zoomInOut($event)"
    @mousedown.left="enterPanning()"
    @mousedown.right="enterRotating()"
    @mousemove="isPanning && panTo($event), isRotating && rotateTo($event)"
    @mouseleave="exitPanning(), exitRotating()"
    @mouseup="exitPanning(), exitRotating()"
    @click.left="onLeftClick($event)"
    @click.middle="initCamera()"
    @contextmenu.prevent="onRightClick($event)"
  >
    <GridLayer />
    <ClusterLayer v-show="props.isClusterShowing" />
    <SegmentLayer />
    <PointLayer />
    <BufferLayer />
    <StationLayer />
    <ZcuLayer />
    <MtlLayer />
    <VehicleLayer />
  </svg>
</template>