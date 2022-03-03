<script setup lang="ts">
import { Point } from '../types/Point'
import RasterizedText from 'MapObjects/map/components/RasterizedText.ce.vue';
import MapReverseRotate from 'MapObjects/rotate/components/MapReverseRotate.ce.vue';
import { inject } from 'vue';
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits';
import { deepCopy } from 'src/utils/deepCopy';
import ScaleByScale from 'src/MapObjects/scale/component/ScaleByScale.ce.vue';

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
    <ScaleByScale>
      <MapReverseRotate>
        <circle
          r="5"
          class="point-path"
          @click.left="onFocus()"
          @click.right="onContextmenu()"
          @mouseover="onTooltipOn()"
          @mouseout="onTooltipOff()"
          @mouseleave="onTooltipOff()"
        />
        <!-- <text y="70">{{ props.point.logicalId }}</text> -->
        <RasterizedText class="invert label" y="10" :text="props.point.logicalId" />
      </MapReverseRotate>
    </ScaleByScale>
  </svg>
</template>