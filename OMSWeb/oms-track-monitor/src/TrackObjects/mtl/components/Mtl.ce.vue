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
import ScaleByScale from 'src/MapObjects/scale/component/ScaleByScale.ce.vue';

const props = defineProps<{
  mtl: Mtl
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const position = usePointPoisiton(toRef(props.mtl, 'pointId'))
const group = useGroup('mtl', toRef(props.mtl, 'id'))

function onMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: "MTL",
    value: deepCopy(props.mtl),
    event
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
function onRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: "MTL",
    value: deepCopy(props.mtl),
    event
  })
}
</script>

<template>
  <svg v-if="position" class="overflow-visible cursor-pointer mtl" :x="position.x" :y="position.y">
    <ScaleByScale>
      <MapReverseRotate>
        <use
          v-if="group"
          href="#mtl"
          class="group-shadow"
          :stroke="getGroupColorWithAlpha(group.color)"
          stroke-width="15"
        />
        <use v-if="props.mtl.isFocused" href="#mtl" class="focus" stroke-width="8" />
        <use
          href="#mtl"
          stroke="grey"
          stroke-width="3"
          @click.left="onLeftClick()"
          @click.right="onRightClick($event)"
          @mouseover="onMouseover($event)"
          @mouseout="onMouseleave()"
          @mouseleave="onMouseleave()"
        />
        <!-- <text y="70">{{ props.mtl.id }}</text> -->
        <RasterizedText class="invert" x="20" y="10" :text="props.mtl.logicalId" />
      </MapReverseRotate>
    </ScaleByScale>
  </svg>
</template>
