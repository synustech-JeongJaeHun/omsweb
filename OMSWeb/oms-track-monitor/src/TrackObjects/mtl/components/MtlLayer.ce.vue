<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import Mtl from './Mtl.ce.vue'
import { findMtlById, mtls } from '../mtls'
import { inject } from 'vue'
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits'

const emit = inject<RootEmits>(RootEmitInjectionKey)!

function getDeepCopiedMtl(event: MouseEvent) {
  const mtlId = parseInt((event.target as SVGElement).dataset.id!)
  const mtl = findMtlById(mtlId)!
  return { ...mtl }
}

function handleMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'MTL',
    value: getDeepCopiedMtl(event),
    event,
  })
}
function handleMouseleave(event: MouseEvent) {
  emit('mouseleaveOnObject')
}
function handleLeftClick(event: MouseEvent) {
  emit('mainClickOnObject', {
    type: 'MTL',
    value: getDeepCopiedMtl(event),
  })
}
function handleRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'MTL',
    value: getDeepCopiedMtl(event),
    event,
  })
}
</script>

<template>
  <Layer id="mtl-layer">
    <defs>
      <!-- 
        pointer-events for event from visiblePainted (default value)
        mtl is always above point
        https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pointer-events
      -->
      <path
        id="mtl"
        pointer-events="visiblePainted"
        fill="none"
        d="
        M -12 -12
        L -8 -8
        L -12 -4
        L -8 0
        L -12 4
        L -8 8
        L -12 12
        L 12 12
        L 8 8
        L 12 4
        L 8 0
        L 12 -4
        L 8 -8
        L 12 -12
        M -8 8
        L 8 8
      "
      />
    </defs>

    <Mtl
      v-for="mtl of mtls"
      :key="mtl.id"
      :mtl="mtl"
      :handleMouseover="handleMouseover"
      :handleMouseleave="handleMouseleave"
      :handleLeftClick="handleLeftClick"
      :handleRightClick="handleRightClick"
    />
  </Layer>
</template>
