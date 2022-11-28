<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import Buffer from './Buffer.ce.vue'
import { buffers, findBufferById } from '../buffers'
import { inject, ref } from 'vue'
import { RootEmitInjectionKey, RootEmits } from 'src/Root/types/RootEmits'
import { scaleStylesInfo } from '../../../styles/styles'

const emit = inject<RootEmits>(RootEmitInjectionKey)!
const teleportRef = ref<SVGGElement>()

function getDeepCopiedBuffer(event: MouseEvent) {
  const bufferId = parseInt((event.target as SVGElement).dataset.id!)
  const buffer = findBufferById(bufferId)!
  return { ...buffer, groupId: buffer.group }
}

function handleMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'BUFFER',
    value: getDeepCopiedBuffer(event),
    event,
  })
}
function handleMouseleave(event: MouseEvent) {
  emit('mouseleaveOnObject')
}
function handleLeftClick(event: MouseEvent) {
  emit('mainClickOnObject', {
    type: 'BUFFER',
    value: getDeepCopiedBuffer(event),
  })
}
function handleRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'BUFFER',
    value: getDeepCopiedBuffer(event),
    event,
  })
}
</script>

<template>
  <Layer id="buffer-layer">
    <defs>
      <!-- 
        pointer-events for event from bounding-box
        https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pointer-events
      -->
      <!-- 
        arc
        https://developer.mozilla.org/ko/docs/Web/SVG/Tutorial/Paths#arcs 
      -->
      <path
        id="buffer"
        pointer-events="bounding-box"
        fill="none"
        d="
        M -12 -4 
        A 8 8 0 0 1 -4 -12
        M 4 -12
        A 8 8 0 0 1 12 -4
        M 12 4
        A 8 8 0 0 1 4 12
        M -4 12 
        A 8 8 0 0 1 -12 4
        "
      />
      <circle id="buffer-group-shadow" r="22" />
    </defs>

    <Buffer
      v-for="buffer of buffers"
      :key="buffer.id"
      :buffer="buffer"
      :margin="scaleStylesInfo.bufferMargin"
      :teleportRef="teleportRef"
      :handleMouseover="handleMouseover"
      :handleMouseleave="handleMouseleave"
      :handleLeftClick="handleLeftClick"
      :handleRightClick="handleRightClick"
    />
    
    <g ref="teleportRef"></g>
  </Layer>
</template>
