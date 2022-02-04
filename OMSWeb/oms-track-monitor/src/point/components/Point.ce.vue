<script setup lang="ts">
import { Point } from '../types/Point'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import MapReverseRotate from '../../rotate/components/MapReverseRotate.ce.vue';
import { inject } from 'vue';
import { RootEmits, RootEmitInjectionKey } from '../../types/RootEmits';

const props = defineProps<{
  point: Point
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

function onLeftClick() {
  emit('leftclick', {})
}

function onMouseOver() {
  emit('mouseover', {})
}

function onRightClick() {
  emit('rightclick', {})
}
</script>

<template>
  <svg class="overflow-visible cursor-pointer" :x="props.point.x" :y="props.point.y">
    <use
      href="#point"
      @click.left="onLeftClick()"
      @click.right="onRightClick()"
      @mouseover="onMouseOver()"
    />
    <MapReverseRotate>
      <!-- <text y="70">{{ props.point.logicalId }}</text> -->
      <RasterizedText class="invert" y="70" :text="props.point.logicalId" />
    </MapReverseRotate>
  </svg>
</template>