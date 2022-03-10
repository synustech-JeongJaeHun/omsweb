<script setup lang="ts">
import { Mtl } from '../types/Mtl'
import RasterizedText from 'MapObjects/map/components/RasterizedText.ce.vue';
import { inject, toRef } from 'vue';
import { usePointPoisiton } from '../../point/points';
import { useGroup } from '../../group/groups';
import MapReverseRotate from 'MapObjects/rotate/components/MapReverseRotate.ce.vue';
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits';
import { deepCopy } from 'src/utils/deepCopy';
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'

const props = defineProps<{
  mtl: Mtl
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const position = usePointPoisiton(toRef(props.mtl, 'pointId'))
const group = useGroup('mtl', toRef(props.mtl, 'id'))

function onMouseover() {
  emit('mouseoverOnObject', {
    type: "MTL",
    value: deepCopy(props.mtl)
  })
}
function onMouseleave() {
  emit('mouseleaveOnObject')
}
function onLeftClick() {
  emit('mainClickOnObject', {
    type: "MTL",
    value: deepCopy(props.mtl)
  })
}
function onRightClick() {
  emit('secondaryClickOnObject', {
    type: "MTL",
    value: deepCopy(props.mtl)
  })
}
</script>

<template>
  <svg class="overflow-visible cursor-pointer mtl" :x="position.x" :y="position.y">
    <use
      v-if="group"
      href="#mtl"
      class="group-shadow"
      :stroke="getGroupColorWithAlpha(group.color)"
      stroke-width="20"
    />
    <use
      href="#mtl"
      stroke="grey"
      stroke-width="10"
      @click.left="onLeftClick()"
      @click.right="onRightClick()"
      @mouseover="onMouseover()"
      @mouseout="onMouseleave()"
      @mouseleave="onMouseleave()"
    />
    <use v-if="props.mtl.isFocused" href="#mtl" class="focus" stroke-width="20" />
    <!-- <text y="70">{{ props.mtl.id }}</text> -->
    <MapReverseRotate>
      <RasterizedText class="invert" x="80" y="45" :text="props.mtl.logicalId" />
    </MapReverseRotate>
  </svg>
</template>
