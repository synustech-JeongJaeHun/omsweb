<script setup lang="ts">
import { ref } from 'vue';
import { pan, zoomIn, zoomOut } from '../camera';
import Layer from './Layer.vue';

const isPanning = ref(false)
function enterPanning() { isPanning.value = true }
function exitPanning() { isPanning.value = false }
function panTo(event: MouseEvent) { pan(event.movementX, event.movementY) }

const isRotating = ref(false)
function enterRotating() { isRotating.value = true }
function exitRotating() { isRotating.value = false }
function rotateTo(event: MouseEvent) { }

function zoomInOut(event: WheelEvent | MouseEvent) {
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
    @mousedown="[enterPanning(), enterRotating(), logg($event)]"
    @mousemove="[isPanning && panTo($event), isRotating && rotateTo($event)]"
    @mouseleave="[exitPanning(), exitRotating()]"
    @mouseup="[exitPanning(), exitRotating()]"
    @click="onLeftClick($event)"
    @dblclick="zoomInOut($event)"
    @contextmenu="onRightClick($event)"
  />
</template>