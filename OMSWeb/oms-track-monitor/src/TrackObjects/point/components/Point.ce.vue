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

function onMouseover() {
  emit('mouseoverOnObject', {
    type: "POINT",
    value: deepCopy(props.point)
  })
}
function onMouseleave() {
  emit('mouseleaveOnObject')
}
function onLeftClick() {
  emit('mainClickOnObject', {
    type: "POINT",
    value: deepCopy(props.point)
  })
}
function onRightClick() {
  emit('secondaryClickOnObject', {
    type: "POINT",
    value: deepCopy(props.point)
  })
}
</script>

<template>
  <svg class="overflow-visible cursor-pointer point" :x="props.point.x" :y="props.point.y">
    <ScaleByScale>
      <MapReverseRotate>
        <circle v-if="props.point.isFocused" r="15" class="focus" />
        <circle
          r="5"
          class="point-path"
          @click.left="onLeftClick()"
          @click.right="onRightClick()"
          @mouseover="onMouseover()"
          @mouseout="onMouseleave()"
          @mouseleave="onMouseleave()"
        />
        <!-- <text y="70">{{ props.point.logicalId }}</text> -->
        <RasterizedText class="invert label" y="10" :text="props.point.logicalId" />
      </MapReverseRotate>
    </ScaleByScale>
  </svg>
</template>