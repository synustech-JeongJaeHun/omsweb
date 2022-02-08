<script setup lang="ts">
import { computed, inject, readonly, toRef } from 'vue';
import { usePointPoisiton } from '../../point/points';
import { addVectors, getUnitVector, multipleVector } from '../../utils/vector';
import { Station } from '../types/Station'
import RasterizedText from '../../map/components/RasterizedText.ce.vue';
import { useGroupColor } from '../../group/groups';
import MapReverseRotate from '../../rotate/components/MapReverseRotate.ce.vue';
import { RootEmitInjectionKey, RootEmits } from '../../types/RootEmits';
import { deepCopy } from '../../utils/deepCopy';

const props = defineProps<{
  station: Station
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const startPointPosition = usePointPoisiton(toRef(props.station, 'pointId'))
const nextPointPosition = usePointPoisiton(toRef(props.station, 'nextPoint'))

const position = readonly(computed(() => {
  if (startPointPosition.value === undefined || nextPointPosition.value === undefined)
    return { x: 0, y: 0 }

  const unitVector = getUnitVector({
    x: nextPointPosition.value.x - startPointPosition.value.x,
    y: nextPointPosition.value.y - startPointPosition.value.y
  })

  const offsetVector = multipleVector(unitVector, props.station.offset)
  const position = addVectors({ x: startPointPosition.value.x, y: startPointPosition.value.y }, offsetVector)
  return { x: Math.ceil(position.x), y: Math.ceil(position.y) }
}))

const groupColor = useGroupColor('station', toRef(props.station, 'id'))

function onTooltipOn() {
  emit('tooltipon', {
    type: 'Station',
    value: deepCopy(props.station)
  })
}
function onTooltipOff() {
  emit('tooltipoff')
}
function onFocus() {
  emit('focus', {
    type: "Station",
    value: deepCopy(props.station)
  })
}
function onContextmenu() {
  emit('contextmenuon', {
    type: "Station",
    value: deepCopy(props.station)
  })
}
</script>

<template>
  <svg class="overflow-visible cursor-pointer" :x="position.x" :y="position.y">
    <use v-show="groupColor" href="#station-group-shadow" class="group-shadow" :fill="groupColor" />
    <use
      href="#station"
      stroke="black"
      stroke-width="15"
      @click.left="onFocus()"
      @click.right="onContextmenu()"
      @mouseover="onTooltipOn()"
      @mouseout="onTooltipOff()"
      @mouseleave="onTooltipOff()"
    />
    <!-- <text y="70">{{ props.station.logicalId }}</text> -->
    <MapReverseRotate>
      <RasterizedText class="invert" x="75" y="45" :text="props.station.logicalId" />
    </MapReverseRotate>
  </svg>
</template>