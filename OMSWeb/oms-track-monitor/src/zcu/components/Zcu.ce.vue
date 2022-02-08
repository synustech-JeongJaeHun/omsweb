<script setup lang="ts">
import { Zcu } from '../types/Zcu'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { inject } from 'vue';
import { RootEmitInjectionKey, RootEmits } from '../../types/RootEmits';
import { deepCopy } from '../../utils/deepCopy';
import MapReverseRotate from '../../rotate/components/MapReverseRotate.ce.vue';

const props = defineProps<{
  zcu: Zcu
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

function onTooltipOn() {
  emit('tooltipon', {
    type: 'Zcu',
    value: deepCopy(props.zcu)
  })
}
function onTooltipOff() {
  emit('tooltipoff')
}
function onFocus() {
  emit('focus', {
    type: "Zcu",
    value: deepCopy(props.zcu)
  })
}
function onContextmenu() {
  emit('contextmenuon', {
    type: "Zcu",
    value: deepCopy(props.zcu)
  })
}
</script>

<template>
  <svg class="overflow-visible cursor-pointer" :x="props.zcu.x" :y="props.zcu.y">
    <use
      href="#zcu"
      @click.left="onFocus()"
      @click.right="onContextmenu()"
      @mouseover="onTooltipOn()"
      @mouseout="onTooltipOff()"
      @mouseleave="onTooltipOff()"
    />
    <!-- <text y="70">{{ props.zcu.id }}</text> -->
    <MapReverseRotate>
      <RasterizedText class="invert" x="65" y="35" :text="String(props.zcu.id)" />
    </MapReverseRotate>
  </svg>
</template>