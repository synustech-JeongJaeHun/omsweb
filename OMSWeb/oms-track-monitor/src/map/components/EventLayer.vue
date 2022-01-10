<script setup lang="ts">
import { ref } from 'vue';
import { zoomIn, zoomOut } from '../camera';
import Layer from './Layer.vue';

const isPanning = ref(false)

function enterPanning() {
  isPanning.value = true
}

function exitPanning() {
  isPanning.value = false
}

function panTo(event: MouseEvent) {
  console.log(event.movementX, event.movementY)
}

function zoomInOut(event: WheelEvent) {
  // scrollToForward: deltaY < 0 
  if (event.deltaX < 0)
    zoomOut(event.clientX, event.clientY)
  else
    // scrollToBackward: deltaY > 0
    zoomIn(event.clientX, event.clientY)
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
  <Layer
    @wheel="zoomInOut($event)"
    @mousedown="enterPanning()"
    @mousemove="isPanning && panTo($event)"
    @mouseleave="exitPanning()"
    @mouseup="exitPanning()"
    @click="onLeftClick($event)"
    @contextmenu="onRightClick($event)"
  />
</template>