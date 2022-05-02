<script setup lang="ts">
import { computed, toRef } from 'vue'
import { Station } from '../types/Station'
import { useGroup } from '../../group/groups'
import { getPositionForBufferOrStation } from 'src/TrackObjects/utils/locationStationBuffer'
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'

const props = defineProps<{
  station: Station
  handleLeftClick: (event: MouseEvent) => void
  handleRightClick: (event: MouseEvent) => void
  handleMouseover: (event: MouseEvent) => void
  handleMouseleave: (event: MouseEvent) => void
}>()

const position = computed(() =>
  getPositionForBufferOrStation(props.station)
)

const group = useGroup('station', toRef(props.station, 'id'))
</script>

<template>
  <svg
    v-if="position"
    class="overflow-visible cursor-pointer station"
    :x="position.x"
    :y="position.y"
    :data-disabled="props.station.unuse"
  >
    <g class="scale-and-reverse-rotate">
      <use
        v-if="group"
        href="#station-group-shadow"
        class="group-shadow"
        :fill="getGroupColorWithAlpha(group.color)"
      />
      <use
        v-if="props.station.isFocused"
        href="#station"
        class="focus"
        stroke-width="10"
      />
      <use
        href="#station"
        class="station-path"
        stroke-width="4"
        :data-id="props.station.id"
        @click.left="handleLeftClick"
        @click.right="handleRightClick"
        @mouseover="handleMouseover"
        @mouseout="handleMouseleave"
        @mouseleave="handleMouseleave"
      />
      <text
        class="invert label select-none"
        x="0"
        y="20"
        alignment-baseline="hanging"
        text-anchor="middle"
        text-rendering="optimizeSpeed"
        pointer-events="none"
      >
        {{ props.station.logicalId }}
      </text>
    </g>
  </svg>
</template>
