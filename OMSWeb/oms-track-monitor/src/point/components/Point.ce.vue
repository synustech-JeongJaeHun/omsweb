<script setup lang="ts">
import { Point } from '../types/Point'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import MapReverseRotate from '../../rotate/components/MapReverseRotate.ce.vue';
import { inject } from 'vue';
import { RootEmits, RootEmitInjectionKey } from '../../types/RootEmits';
import { deepCopy } from '../../utils/deepCopy';

const props = defineProps<{
  point: Point,
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

function onTooltipOn() {
  emit('tooltipon', {
    type: 'Point',
    value: deepCopy(props.point)
  })
}
function onTooltipOff() {
  emit('tooltipoff')
}
function onFocus() {
  emit('focus', {
    type: "Point",
    value: deepCopy(props.point)
  })
}
function onContextmenu() {
  emit('contextmenuon', {
    type: "Point",
    value: deepCopy(props.point)
  })
}
</script>

<template>
  <svg class="overflow-visible cursor-pointer point" :x="props.point.x" :y="props.point.y">
    <use
      href="#point-circle"
      class="point-path"
      @click.left="onFocus()"
      @click.right="onContextmenu()"
      @mouseover="onTooltipOn()"
      @mouseout="onTooltipOff()"
      @mouseleave="onTooltipOff()"
    />
    <MapReverseRotate>
      <!-- <text y="70">{{ props.point.logicalId }}</text> -->
      <RasterizedText class="invert label" y="70" :text="props.point.logicalId" />
    </MapReverseRotate>
  </svg>
</template>