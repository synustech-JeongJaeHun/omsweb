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
  <svg class="overflow-visible cursor-pointer zcu" :x="props.zcu.x" :y="props.zcu.y">
    <ScaleByScale>
      <MapReverseRotate>
        <use
          href="#zcu"
          :fill="props.zcu.error ? 'red' : 'transparent'"
          @click.left="onFocus()"
          @click.right="onContextmenu()"
          @mouseover="onTooltipOn()"
          @mouseout="onTooltipOff()"
          @mouseleave="onTooltipOff()"
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