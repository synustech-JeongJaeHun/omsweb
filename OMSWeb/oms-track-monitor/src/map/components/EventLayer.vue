<script setup lang="ts">
import { ref } from 'vue';
import { pan, zoomIn, zoomOut } from '../camera';
import Layer from './Layer.vue';

// MouseEvent.button
// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
// 0: [LEFT] Main button pressed, usually the left button or the un-initialized state
// 1: [WHEEL] Auxiliary button pressed, usually the wheel button or the middle button (if present)
// 2: [RIGHT] Secondary button pressed, usually the right button
// 3: Fourth button, typically the Browser Back button
// 4: Fifth button, typically the Browser Forward button

const isPanning = ref(false)
function enterPanning() { isPanning.value = true }
function exitPanning() { isPanning.value = false }
function panTo(event: MouseEvent) { pan(event.movementX, event.movementY) }

const isRotating = ref(false)
function enterRotating() { isRotating.value = true }
function exitRotating() { isRotating.value = false }
function rotateTo(event: MouseEvent) { }

function zoomInOut(event: WheelEvent | MouseEvent) {
  // WheelEvent
  // https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaY
  // scrollToForward: deltaY < 0 
  // scrollToBackward: deltaY > 0

  const action = (event instanceof WheelEvent) && (event.deltaY > 0) ? zoomOut : zoomIn
  action(event.clientX, event.clientY)
}

function onLeftClick(event: MouseEvent) {
  event.clientX
  event.clientY
}
function onRightClick(event: MouseEvent) {
  event.clientX
  event.clientY
}

function logg(event: any) {
  console.log(event)
}
</script>

<template>
  <Layer
    @wheel="zoomInOut($event)"
    @mousedown="[$event.button === 0 && enterPanning(), $event.button === 2 && enterRotating(), logg($event)]"
    @mousemove="[isPanning && panTo($event), isRotating && rotateTo($event)]"
    @mouseleave="[exitPanning(), exitRotating()]"
    @mouseup="[exitPanning(), exitRotating()]"
    @click="onLeftClick($event)"
    @dblclick="zoomInOut($event)"
    @contextmenu.prevent="onRightClick($event)"
  />
</template>