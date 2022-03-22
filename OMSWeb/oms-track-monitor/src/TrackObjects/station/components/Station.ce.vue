<script setup lang="ts">
import { computed, inject, readonly, toRef } from 'vue'
import { Station } from '../types/Station'
import { useGroup } from '../../group/groups'
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits'
import { getPositionForBufferOrStation } from 'src/TrackObjects/utils/locationStationBuffer'
import { deepCopy } from 'src/utils/deepCopy'
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'

const props = defineProps<{
  station: Station
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const position = readonly(
  computed(() => getPositionForBufferOrStation(props.station))
)
const group = useGroup('station', toRef(props.station, 'id'))

function onMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: 'STATION',
    value: deepCopy(props.station),
    event,
  })
}
function onMouseleave() {
  emit('mouseleaveOnObject')
}
function onLeftClick() {
  emit('mainClickOnObject', {
    type: 'STATION',
    value: deepCopy(props.station),
  })
}
function onRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: 'STATION',
    value: deepCopy(props.station),
    event,
  })
}
</script>

<template>
  <svg
    v-if="position"
    class="overflow-visible cursor-pointer station"
    :x="position.x"
    :y="position.y"
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
        @click.left="onLeftClick()"
        @click.right="onRightClick($event)"
        @mouseover="onMouseover($event)"
        @mouseout="onMouseleave()"
        @mouseleave="onMouseleave()"
      />
      <text
        class="invert label select-none"
        x="0"
        y="20"
        alignment-baseline="hanging"
        text-anchor="middle"
        text-rendering="optimizeSpeed"
        font-size="0.9em"
        pointer-events="none"
      >
        {{ props.station.logicalId }}
      </text>
    </g>
  </svg>
</template>
