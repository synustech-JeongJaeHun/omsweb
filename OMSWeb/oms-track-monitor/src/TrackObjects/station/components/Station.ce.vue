<script setup lang="ts">
import { computed, inject, readonly, toRef } from 'vue';
import { Station } from '../types/Station'
import RasterizedText from 'MapObjects/map/components/RasterizedText.ce.vue';
import { useGroup } from '../../group/groups';
import MapReverseRotate from 'MapObjects/rotate/components/MapReverseRotate.ce.vue';
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits';
import { getPositionForBufferOrStation } from 'src/TrackObjects/utils/locationStationBuffer';
import { deepCopy } from 'src/utils/deepCopy';
import ScaleByScale from 'src/MapObjects/scale/component/ScaleByScale.ce.vue';
import { getGroupColorWithAlpha } from 'TrackObjects/group/utils/color'

const props = defineProps<{
  station: Station
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const position = readonly(computed(() => getPositionForBufferOrStation(props.station)))
const group = useGroup('station', toRef(props.station, 'id'))


function onMouseover(event: MouseEvent) {
  emit('mouseoverOnObject', {
    type: "STATION",
    value: deepCopy(props.station),
    event
  })
}
function onMouseleave() {
  emit('mouseleaveOnObject')
}
function onLeftClick() {
  emit('mainClickOnObject', {
    type: "STATION",
    value: deepCopy(props.station)
  })
}
function onRightClick(event: MouseEvent) {
  emit('secondaryClickOnObject', {
    type: "STATION",
    value: deepCopy(props.station),
    event
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
    <ScaleByScale>
      <MapReverseRotate>
        <use
          v-if="group"
          href="#station-group-shadow"
          class="group-shadow"
          :fill="getGroupColorWithAlpha(group.color)"
        />
        <use v-if="props.station.isFocused" href="#station" class="focus" stroke-width="10" />
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
        <RasterizedText class="invert" x="15" y="-10" :text="props.station.logicalId" />
      </MapReverseRotate>
    </ScaleByScale>
  </svg>
</template>