<script setup lang="ts">
import { Mtl } from '../types/Mtl'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { inject, toRef } from 'vue';
import { usePointPoisiton } from '../../point/points';
import { useGroupColor } from '../../group/groups';
import { RootEmitInjectionKey, RootEmits } from '../../types/RootEmits';
import { deepCopy } from '../../utils/deepCopy';
import MapReverseRotate from '../../rotate/components/MapReverseRotate.ce.vue';

const props = defineProps<{
  mtl: Mtl
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const position = usePointPoisiton(toRef(props.mtl, 'pointId'))
const groupColor = useGroupColor('mtl', toRef(props.mtl, 'id'))

function onTooltipOn() {
  emit('tooltipon', {
    type: 'Mtl',
    value: deepCopy(props.mtl)
  })
}
function onTooltipOff() {
  emit('tooltipoff')
}
function onFocus() {
  emit('focus', {
    type: "Mtl",
    value: deepCopy(props.mtl)
  })
}
function onContextmenu() {
  emit('contextmenuon', {
    type: "Mtl",
    value: deepCopy(props.mtl)
  })
}
</script>

<template>
  <svg class="overflow-visible cursor-pointer" :x="position.x" :y="position.y">
    <use
      v-show="groupColor"
      href="#mtl"
      class="group-shadow"
      :stroke="groupColor"
      stroke-width="20"
    />
    <use
      href="#mtl"
      stroke="grey"
      stroke-width="10"
      @click.left="onFocus()"
      @click.right="onContextmenu()"
      @mouseover="onTooltipOn()"
      @mouseout="onTooltipOff()"
      @mouseleave="onTooltipOff()"
    />
    <!-- <text y="70">{{ props.mtl.id }}</text> -->
    <MapReverseRotate>
      <RasterizedText class="invert" x="80" y="45" :text="props.mtl.logicalId" />
    </MapReverseRotate>
  </svg>
</template>
