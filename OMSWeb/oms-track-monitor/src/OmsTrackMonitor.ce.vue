<script setup lang="ts">
import { computed, provide, reactive, readonly, ref, watch } from 'vue'
import { makeFsProxy } from './utils/devMode'

import { IOmsTrackMonitor } from './legacies/IOmsTrackMonitor'
import { IPreferences } from './legacies/models/setting.model'

import { buffers } from './buffer/buffers'
import { clusters } from './cluster/clusters'
import { groups } from './group/groups'
import { calculateMinMaxXYFromPoints } from './map/utils/size'
import { mtls } from './mtl/mtls'
import { points } from './point/points'
import { segmentDisableds } from './segment/segmentDisableds'
import { stations } from './station/stations'
import { findVehicleById, updateExistVehicle, vehicles } from './vehicle/vehicles'
import { zcus } from './zcu/zcus'
import { ViewMode } from './map/types/ViewMode'
import { MapType } from './map/types/MapType'
import Map from './map/components/Map.ce.vue'
import Minimap from './minimap/components/Minimap.ce.vue'
import { initMapSizeProperties } from './map/mapSizeProperties'
import { cameraInfo, initCamera, resizeElement } from './map/camera'
import { segments } from './segment/segments'
import { makeSegmentsFromParts } from './segment/utils/segment'
import { parseNumberProp } from './utils/props'

const props = defineProps<{
  width?: number | string,
  height?: number | string,
}>()

const emit = defineEmits<{
  (e: 'backdrop', value: {}): void
}>()

// State Start
const container = ref<HTMLDivElement>();
const shadowRoot = readonly(computed(() => container.value?.getRootNode()))

const viewMode = ref<ViewMode>('PUBLIC')
const mapType = ref<MapType>('DB');
const permissions = reactive({
  canManageOrders: false,
  canManageVehicles: false,
  canManageDisplaySettings: false
})
const preferences = ref<IPreferences>()
// State End

// Provide Start
provide('shadowRoot', shadowRoot)
// Provide End

// Watch Start
watch(props, (props) => {
  const width = parseNumberProp(0, props.width)
  const height = parseNumberProp(0, props.height)
  resizeElement(width, height)
})
// Watch End

const exposed: IOmsTrackMonitor = {
  setViewMode: function (v) { viewMode.value = v },
  setPreference: function (p) { preferences.value = p },
  setTrack: function (t) {
    mapType.value = t.mapType ?? "DB"

    const { minX, minY, maxX, maxY } = calculateMinMaxXYFromPoints(t.points ?? [])
    initMapSizeProperties(minX, minY, maxX, maxY)
    initCamera()

    // Order is IMPORTANT!
    // point must be initialized first.
    points.value = t.points ?? []
    buffers.value = t.buffers ?? []
    clusters.value = t.clusters ?? []
    groups.value = t.groups ?? []
    mtls.value = t.mtls ?? []
    segments.value = makeSegmentsFromParts(t.segmentParts ?? [])
    stations.value = t.stations ?? []
    zcus.value = t.zcus ?? []
    vehicles.value = t.vehicles ?? []
    segmentDisableds.value = t.segmentDisabled ?? []
  },

  updateVehicle: function (op, v) {
    const vehicle = findVehicleById(v.id)
    switch (op) {
      case 'INSERT':
      case 'UPDATE':
        if (vehicle) updateExistVehicle(vehicle, v)
        else vehicles.value.push(v)
        break;

      case 'DELETE':
        if (vehicle) {
          const index = vehicles.value.indexOf(vehicle)
          vehicles.value.splice(index, 1)
        }
        break;
    }
  },
  updateSegment: function (op, v) { }
}
const exposedProxy = makeFsProxy(exposed)
defineExpose(exposedProxy)

</script>

<template>
  <div
    ref="container"
    class="relative"
    :style="{
      width: `${cameraInfo.elementWidth}px`,
      height: `${cameraInfo.elementHeight}px`,
    }"
  >
    <Map
      class="absolute"
      :style="{
        top: 0,
        left: 0,
        width: `${cameraInfo.elementWidth}px`,
        height: `${cameraInfo.elementHeight}px`,
      }"
    />
    <Minimap class="absolute" :style="{
      bottom: '2vw',
      left: '2vw',
    }" />
  </div>
</template>

<!-- https://v3.vuejs.org/api/sfc-spec.html#src-imports -->
<!-- https://github.com/vuejs/vue-next/issues/4662 -->
<!-- https://v3.vuejs.org/guide/web-components.html#sfc-as-custom-element -->
<style src="./styles/utility.css"></style>
<style src="./styles/zoom.css"></style>
<style src="./styles/pan.css"></style>
<style src="./styles/invert.css"></style>

<!-- Plan B -->
<!-- https://stackoverflow.com/questions/69797635/how-do-i-create-a-vue-3-custom-element-including-child-component-styles -->