<script setup lang="ts">
import { Zcu } from '../types/Zcu'
import RasterizedText from 'MapObjects/map/components/RasterizedText.ce.vue';
import { inject } from 'vue';
import MapReverseRotate from 'MapObjects/rotate/components/MapReverseRotate.ce.vue';
import { getHumanReadableUsingType } from '../utils/readable'
import { RootEmitInjectionKey, RootEmits } from '../../../types/RootEmits';
import { deepCopy } from '../../../utils/deepCopy';

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

          <!-- d3_this
            .select('.zcu_path')
            .attr('fill', d.error ? 'red' : dom_css.color_zcu)
            .attr('stroke', dom_css.color_zcu)
            .attr('stroke-width', dom_css.line_weight); -->

<template>
  <svg class="overflow-visible cursor-pointer" :x="props.zcu.x" :y="props.zcu.y">
    <use
      href="#zcu"
      :fill="props.zcu.error ? 'red' : 'transparent'"
      @click.left="onFocus()"
      @click.right="onContextmenu()"
      @mouseover="onTooltipOn()"
      @mouseout="onTooltipOff()"
      @mouseleave="onTooltipOff()"
    />
    <!-- <text y="70">{{ props.zcu.id }}</text> -->
    <MapReverseRotate>
      <RasterizedText
        class="invert"
        x="-85"
        y="-55"
        :text="getHumanReadableUsingType(props.zcu.usingType)"
      />
      <RasterizedText class="invert" x="65" y="35" :text="String(props.zcu.id)" />
    </MapReverseRotate>
  </svg>
</template>