<script setup lang="ts">
import { computed, inject, readonly, toRef } from 'vue'
import { Buffer } from '../types/Buffer'
import RasterizedText from 'MapObjects/map/components/RasterizedText.ce.vue'
import { useGroupColor } from '../../group/groups'
import MapReverseRotate from 'MapObjects/rotate/components/MapReverseRotate.ce.vue'
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits'
import { getPositionForBufferOrStation } from 'src/TrackObjects/utils/locationStationBuffer'
import { deepCopy } from 'src/utils/deepCopy'
import ScaleByScale from 'src/MapObjects/scale/component/ScaleByScale.ce.vue'

const props = defineProps<{
  buffer: Buffer
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const position = readonly(computed(() => getPositionForBufferOrStation(props.buffer)))
const groupColor = useGroupColor('buffer', toRef(props.buffer, 'id'))

function onMouseover() {
  emit('mouseoverOnObject', {
    type: "BUFFER",
    value: deepCopy(props.buffer)
  })
}
function onMouseleave() {
  emit('mouseleaveOnObject')
}
function onLeftClick() {
  emit('mainClickOnObject', {
    type: "BUFFER",
    value: deepCopy(props.buffer)
  })
}
function onRightClick() {
  emit('secondaryClickOnObject', {
    type: "BUFFER",
    value: deepCopy(props.buffer)
  })
}
</script>

<template>
  <svg
    v-if="position"
    class="overflow-visible cursor-pointer buffer"
    :x="position.x"
    :y="position.y"
  >
    <ScaleByScale>
      <MapReverseRotate>
        <use
          v-show="groupColor"
          class="group-shadow"
          href="#buffer-group-shadow"
          :fill="groupColor"
        />
        <use v-if="props.buffer.isFocused" href="#buffer" class="focus" stroke-width="10" />
        <use
          href="#buffer"
          class="buffer-path"
          stroke-width="4"
          @click.left="onLeftClick()"
          @click.right="onRightClick()"
          @mouseover="onMouseover()"
          @mouseout="onMouseleave()"
          @mouseleave="onMouseleave()"
        />
        <RasterizedText class="invert" x="10" y="5" :text="props.buffer.logicalId" />
      </MapReverseRotate>
    </ScaleByScale>
  </svg>
</template>