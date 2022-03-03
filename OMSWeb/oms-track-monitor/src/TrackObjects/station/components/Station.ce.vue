<script setup lang="ts">
import { computed, inject, readonly, toRef } from 'vue';
import { Station } from '../types/Station'
import RasterizedText from 'MapObjects/map/components/RasterizedText.ce.vue';
import { useGroupColor } from '../../group/groups';
import MapReverseRotate from 'MapObjects/rotate/components/MapReverseRotate.ce.vue';
import { RootEmitInjectionKey, RootEmits } from 'src/types/RootEmits';
import { getPositionForBufferOrStation } from 'src/TrackObjects/utils/locationStationBuffer';
import { deepCopy } from 'src/utils/deepCopy';
import ScaleByScale from 'src/MapObjects/scale/component/ScaleByScale.ce.vue';

const props = defineProps<{
  station: Station
}>()
const emit = inject<RootEmits>(RootEmitInjectionKey)!

const position = readonly(computed(() => getPositionForBufferOrStation(props.station)))
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
  <svg
    v-if="position"
    class="overflow-visible cursor-pointer station"
    :x="position.x"
    :y="position.y"
  >
    <ScaleByScale>
      <MapReverseRotate>
        <use
          v-show="groupColor"
          href="#station-group-shadow"
          class="group-shadow"
          :fill="groupColor"
        />
        <use
          href="#station"
          class="station-path"
          @click.left="onFocus()"
          @click.right="onContextmenu()"
          @mouseover="onTooltipOn()"
          @mouseout="onTooltipOff()"
          @mouseleave="onTooltipOff()"
        />
        <RasterizedText class="invert" x="15" y="-10" :text="props.station.logicalId" />
      </MapReverseRotate>
    </ScaleByScale>
  </svg>
</template>