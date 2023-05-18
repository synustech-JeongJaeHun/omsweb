<script setup lang="ts">
import Layer from 'MapObjects/map/components/Layer.ce.vue'
import { backdrops, findBackdropById } from '../backdrops'
import { inject, ref } from 'vue'
import { RootEmitInjectionKey, RootEmits } from 'src/Root/types/RootEmits'
import Backdrop from './Backdrop.ce.vue'

const emit = inject<RootEmits>(RootEmitInjectionKey)!
const teleportRef = ref<SVGGElement>()

function getDeepCopiedBuffer(event: MouseEvent) {
  const bufferId = parseInt((event.target as SVGElement).dataset.id!)
  const backdrop = findBackdropById(bufferId)!
  return { ...backdrop}
}
</script>

<template>
  <Layer id="backdrop-layer">
    <Backdrop
      v-for="backdrop of backdrops"
      :backdrop="backdrop"
    />
  </Layer>
</template>
