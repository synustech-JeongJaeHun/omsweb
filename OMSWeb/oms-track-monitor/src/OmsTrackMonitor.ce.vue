<script setup lang="ts">
import { provide, reactive, readonly, ref, watch } from 'vue'
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
import { parseNumberProp, parseBooleanProp } from './utils/props'
import Scale from './scale/component/Scale.ce.vue'
import { makeClustersFromSegments } from './cluster/utils/cluster'
import { makeGroups } from './group/utils/group'
import { RootEmitInjectionKey, RootEmits } from './types/RootEmits'

/**
 * https://v3.vuejs.org/api/sfc-script-setup.html#typescript-only-features
 * 
 * Currently complex types and type imports from other files are not supported. It is theoretically possible to support type imports in the future.
 * 
 * As of now, the type declaration argument must be one of the following to ensure correct static   analysis:
 * - A type literal
 * - A reference to an interface or a type literal in the same file
 */
const props = defineProps<{
  width: number | string | undefined,
  height: number | string | undefined,
  isClusterShowing: boolean | string | undefined,
  isGroupShowing: boolean | string | undefined,
}>()

interface Emits extends RootEmits { }
const emit = defineEmits<Emits>()
provide(RootEmitInjectionKey, readonly(emit))
// const emit = inject<RootEmits>(RootEmitInjectionKey)!

// watching props for unstable props delivery
watch(props, (props, prevProps) => {
  const width = parseNumberProp(0, props.width)
  const height = parseNumberProp(0, props.height)
  resizeElement(width, height)
})

// State Start
const container = ref<HTMLDivElement>();

const viewMode = ref<ViewMode>('PUBLIC')
const mapType = ref<MapType>('DB');
const permissions = reactive({
  canManageOrders: false,
  canManageVehicles: false,
  canManageDisplaySettings: false
})
const preferences = ref<IPreferences>()
// State End

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
    mtls.value = t.mtls ?? []
    segments.value = makeSegmentsFromParts(t.segmentParts ?? [])
    clusters.value = makeClustersFromSegments(t.clusters ?? [], segments.value)
    stations.value = t.stations ?? []
    zcus.value = t.zcus ?? []
    vehicles.value = t.vehicles ?? []
    segmentDisableds.value = t.segmentDisabled ?? []
    groups.value = makeGroups(t.groups ?? [])
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
// # in devmode
const exposedProxy = makeFsProxy(exposed)
defineExpose(exposedProxy)

// # production
// defineExpose(exposed)

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
      :isClusterShowing="parseBooleanProp(false, props.isClusterShowing)"
      :isGroupShowing="parseBooleanProp(false, props.isGroupShowing)"
    />
    <Minimap class="absolute" style="bottom: 2vw; left: 2vw;" />
    <Scale class="absolute" style="bottom: 10px; right: 10px;" />
  </div>
</template>

<!-- https://v3.vuejs.org/api/sfc-spec.html#src-imports -->
<!-- https://github.com/vuejs/vue-next/issues/4662 -->
<!-- https://v3.vuejs.org/guide/web-components.html#sfc-as-custom-element -->
<style src="./styles/utility.css"></style>
<style src="./styles/zoom.css"></style>
<style src="./styles/pan.css"></style>
<style src="./styles/rotate.css"></style>
<style src="./styles/invert.css"></style>
<style src="./styles/group.css"></style>

<!-- Plan B -->
<!-- https://stackoverflow.com/questions/69797635/how-do-i-create-a-vue-3-custom-element-including-child-component-styles -->