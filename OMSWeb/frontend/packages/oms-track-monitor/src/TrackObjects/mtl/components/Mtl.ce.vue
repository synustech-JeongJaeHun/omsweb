<script setup lang="ts">
import { Mtl } from '../types/Mtl'
import { toRef } from 'vue'
import { usePointPoisiton } from '../../point/points'
import { useGroup } from '../../group/groups'
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'

const props = defineProps<{
  mtl: Mtl
  handleLeftClick: (event: MouseEvent) => void
  handleRightClick: (event: MouseEvent) => void
  handleMouseover: (event: MouseEvent) => void
  handleMouseleave: (event: MouseEvent) => void
}>()
const position = usePointPoisiton(toRef(props.mtl, 'pointId'))
const group = useGroup('mtl', toRef(props.mtl, 'id'))
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
        :data-id="props.mtl.id"
        @click.left="handleLeftClick"
        @click.right="handleRightClick"
        @mouseover="handleMouseover"
        @mouseout="handleMouseleave"
        @mouseleave="handleMouseleave"
      />
      <text
        class="invert label select-none"
        x="0"
        y="-30"
        alignment-baseline="hanging"
        text-anchor="middle"
        text-rendering="optimizeSpeed"
        pointer-events="none"
      >
        {{ props.mtl.logicalId }}
      </text>
    </g>
  </svg>
</template>
