<script setup lang="ts">
import { computed, inject, readonly, toRef } from 'vue'
import { Buffer } from '../types/Buffer'
import RasterizedText from '../../map/components/RasterizedText.ce.vue'
import { useGroupColor } from '../../group/groups'
import { RootEmitInjectionKey, RootEmits } from '../../types/RootEmits'
import { deepCopy } from '../../utils/deepCopy'
import MapReverseRotate from '../../rotate/components/MapReverseRotate.ce.vue'
import { getPositionForBufferOrStation } from '../../utils/locationStationBuffer'

const props = defineProps<{
  buffer: Buffer
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const position = readonly(computed(() => getPositionForBufferOrStation(props.buffer)))
const groupColor = useGroupColor('buffer', toRef(props.buffer, 'id'))

function onTooltipOn() {
  emit('tooltipon', {
    type: 'Buffer',
    value: deepCopy(props.buffer)
  })
}
function onTooltipOff() {
  emit('tooltipoff')
}
function onFocus() {
  emit('focus', {
    type: "Buffer",
    value: deepCopy(props.buffer)
  })
}
function onContextmenu() {
  emit('contextmenuon', {
    type: "Buffer",
    value: deepCopy(props.buffer)
  })
}
</script>


<template>
  <svg class="overflow-visible cursor-pointer" :x="position.x" :y="position.y">
    <use v-show="groupColor" href="#buffer-group-shadow" :fill="groupColor" />
    <use
      href="#buffer"
      stroke="black"
      stroke-width="15"
      @click.left="onFocus()"
      @click.right="onContextmenu()"
      @mouseover="onTooltipOn()"
      @mouseout="onTooltipOff()"
      @mouseleave="onTooltipOff()"
    />
    <!-- <text y="70">{{ props.buffer.logicalId }}</text> -->
    <MapReverseRotate>
      <RasterizedText class="invert" x="75" y="45" :text="props.buffer.logicalId" />
    </MapReverseRotate>
  </svg>
</template>