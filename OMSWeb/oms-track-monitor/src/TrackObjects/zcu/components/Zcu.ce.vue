<script setup lang="ts">
import { Zcu } from '../types/Zcu'
import RasterizedText from 'MapObjects/map/components/RasterizedText.ce.vue';
import { inject } from 'vue';
import MapReverseRotate from 'MapObjects/rotate/components/MapReverseRotate.ce.vue';
import { getHumanReadableUsingType } from '../utils/readable'
import { RootEmitInjectionKey, RootEmits } from '../../../types/RootEmits';
import { deepCopy } from '../../../utils/deepCopy';
import ScaleByScale from 'src/MapObjects/scale/component/ScaleByScale.ce.vue';

const props = defineProps<{
  zcu: Zcu
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

function onMouseover() {
  emit('mouseoverOnObject', {
    type: "ZCU",
    value: deepCopy(props.zcu)
  })
}
function onMouseleave() {
  emit('mouseleaveOnObject')
}
function onLeftClick() {
  emit('mainClickOnObject', {
    type: "ZCU",
    value: deepCopy(props.zcu)
  })
}
function onRightClick() {
  emit('secondaryClickOnObject', {
    type: "ZCU",
    value: deepCopy(props.zcu)
  })
}
</script>

<template>
  <svg class="overflow-visible cursor-pointer zcu" :x="props.zcu.x" :y="props.zcu.y">
    <ScaleByScale>
      <MapReverseRotate>
        <use v-if="props.zcu.isFocused" href="#zcu" class="focus" fill="none" />

        <!-- 
        pointer-events for event from bounding-box
        https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/pointer-events
        -->
        <use
          href="#zcu"
          pointer-events="bounding-box"
          stroke="black"
          stroke-width="3"
          :fill="props.zcu.error ? 'red' : 'transparent'"
          @click.left="onLeftClick()"
          @click.right="onRightClick()"
          @mouseover="onMouseover()"
          @mouseout="onMouseleave()"
          @mouseleave="onMouseleave()"
        />

        <RasterizedText
          class="invert"
          x="-45"
          y="-30"
          :text="getHumanReadableUsingType(props.zcu.usingType)"
        />
        <RasterizedText class="invert" x="18" y="9" :text="String(props.zcu.id)" />
      </MapReverseRotate>
    </ScaleByScale>
  </svg>
</template>