<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import Zcu from './Zcu.ce.vue'
import { findZcuById, zcus } from '../zcus'
import { inject } from 'vue'
import { RootEmitInjectionKey, RootEmits } from 'src/Root/types/RootEmits'

const emit = inject<RootEmits>(RootEmitInjectionKey)!

function getDeepCopiedZcu(event: MouseEvent) {
  const zcuId = parseInt((event.target as SVGElement).dataset.id!)
  const zcu = findZcuById(zcuId)!
  return { ...zcu }
}

function handleMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'ZCU',
    value: getDeepCopiedZcu(event),
    event,
  })
}

let clientX: number
let clientY: number
function handleMouseleave(event: MouseEvent) {
  if(clientX !== event.clientX || clientY !== event.clientY){
    emit('mouseleaveOnObject')
    clientX = event.clientX
    clientY = event.clientY
  }
}
function handleLeftClick(event: MouseEvent) {
  emit('mainClickOnObject', {
    type: 'ZCU',
    value: getDeepCopiedZcu(event),
  })
}
function handleRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'ZCU',
    value: getDeepCopiedZcu(event),
    event,
  })
}
</script>

<template>
  <Layer id="zcu-layer">
    <defs>
      <path id="zcu" d="M 0 -12 L 12 0 L 0 12 L -12 0 Z" />
    </defs>
    <Zcu
      v-for="zcu of zcus"
      :key="zcu.id"
      :zcu="zcu"
      :handleMouseover="handleMouseover"
      :handleMouseleave="handleMouseleave"
      :handleLeftClick="handleLeftClick"
      :handleRightClick="handleRightClick"
    />
  </Layer>
</template>
