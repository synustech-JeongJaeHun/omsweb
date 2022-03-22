<script setup lang="ts">
import { Mtl } from '../types/Mtl'
import { inject, toRef } from 'vue'
import { usePointPoisiton } from '../../point/points'
import { useGroup } from '../../group/groups'
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits'
import { deepCopy } from 'src/utils/deepCopy'
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'

const props = defineProps<{
  mtl: Mtl
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const position = usePointPoisiton(toRef(props.mtl, 'pointId'))
const group = useGroup('mtl', toRef(props.mtl, 'id'))

function onMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'MTL',
    value: deepCopy(props.mtl),
    event,
  })
}
function onMouseleave() {
  emit('mouseleaveOnObject')
}
function onLeftClick() {
  emit('mainClickOnObject', {
    type: 'MTL',
    value: deepCopy(props.mtl),
  })
}
function onRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'MTL',
    value: deepCopy(props.mtl),
    event,
  })
}
</script>

<template>
  <svg
    v-if="position"
    class="overflow-visible cursor-pointer mtl"
    :x="position.x"
    :y="position.y"
  >
    <g class="scale-and-reverse-rotate">
      <use
        v-if="group"
        href="#mtl"
        class="group-shadow"
        :stroke="getGroupColorWithAlpha(group.color)"
        stroke-width="15"
      />
      <use
        v-if="props.mtl.isFocused"
        href="#mtl"
        class="focus"
        stroke-width="8"
      />
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
      <text
        class="invert label select-none"
        x="0"
        y="-30"
        alignment-baseline="hanging"
        text-anchor="middle"
        text-rendering="optimizeSpeed"
        font-size="0.9em"
        pointer-events="none"
      >
        {{ props.mtl.logicalId }}
      </text>
    </g>
  </svg>
</template>
