<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { makeFsProxy } from './utils/devMode'

import { IOmsTrackMonitor } from './legacies/IOmsTrackMonitor'
import { IPreferences, UiStates } from './legacies/models/setting.model'
import { MapDataService } from './legacies/serivces/MapData.service'
import { MapStatesService } from './legacies/serivces/MapStates.service'

import { buffers } from './buffer/buffers'
import { clusters } from './cluster/clusters'
import { groups } from './group/groups'
import { calculateMinMaxXYFromPoints } from './map/utils/size'
import { mtls } from './mtl/mtls'
import { points } from './point/points'
import { segmentDisableds } from './segment/segmentDisableds'
import { segments } from './segment/segments'
import { stations } from './station/stations'
import { findVehicleById, vehicles } from './vehicle/vehicles'
import { zcus } from './zcu/zcus'
import { ViewMode } from './map/types/ViewMode'
import { MapType } from './map/types/MapType'
import Map from './map/components/Map.ce.vue'
import Minimap from './map/components/Minimap.ce.vue'
import { initMapSizeProperties } from './map/mapSizeProperties'
import { cameraInfo, initCamera, resizeElement } from './map/camera'

const props = defineProps<{
  width?: number | string,
  height?: number | string,
}>()
const width = computed(() => parseNumberProp(0, props.width))
const height = computed(() => parseNumberProp(0, props.height))

const emit = defineEmits<{
  (e: 'backdrop', value: {}): void
}>()

// State Start

const viewMode = ref<ViewMode>('PUBLIC')
const mapType = ref<MapType>('DB');
const permissions = reactive({
  canManageOrders: false,
  canManageVehicles: false,
  canManageDisplaySettings: false
})
const preferences = ref<IPreferences>()
const services = reactive<{
  mapDataService?: MapDataService
  mapStatesService?: MapStatesService
}>({})

// State End

// Computed Start
function parseNumberProp(defaultValue: number, n?: number | string) {
  const type = typeof n
  switch (type) {
    case "number":
      return n as number
    case "string":
      return parseInt(n as string)
    default:
      return defaultValue;
  }
}

// Computed End

// Watch Start

// props changes
watch(props, (props) => {
  resizeElement(width.value, height.value)
})
// Watch End


const exposed: IOmsTrackMonitor = {
  construct: function (
    mode,
    trackSvgId, // discard
    minimapSvgId, // discard
    dataSvc,
    stateSvc
  ) {
    viewMode.value = mode
    services.mapDataService = dataSvc
    services.mapStatesService = stateSvc
  },
  setup: function (
    paramPreferences,
    can_manage_orders,
    can_manage_vehicles,
    can_modify_display_settings
  ) {
    preferences.value = paramPreferences
    permissions.canManageOrders = can_manage_orders ?? false
    permissions.canManageVehicles = can_manage_vehicles ?? false
    permissions.canManageDisplaySettings = can_modify_display_settings ?? false
  },
  create_track: function (data) {
    mapType.value = data.mapType ?? "DB"

    buffers.value = data.buffers ?? []
    clusters.value = data.clusters ?? []
    groups.value = data.groups ?? []
    mtls.value = data.mtls ?? []
    points.value = data.points ?? []
    segments.value = data.segments ?? []
    stations.value = data.stations ?? []
    zcus.value = data.zcus ?? []
    vehicles.value = data.vehicles ?? []
    segmentDisableds.value = data.segmentDisabled ?? []

    const { minX, minY, maxX, maxY } = calculateMinMaxXYFromPoints(points.value)
    initMapSizeProperties(minX, minY, maxX, maxY)
    initCamera()
  },


  adjust_floaters: function () { },
  applyAfterSnapshotUpdated: function (updatedPropList) { },
  applyUpdatedExpectedPath: function () { },

  destroy: function () { },
  get_selected_objects: function (object_type) {
    return []
  },
  getUiStates: function () {
    return new UiStates()
  },
  hasShownLayoutObjects: function (objectType, objectId) {
    return true
  },
  highlight: function (
    object_type,
    object_id,
    object_css,
    group_type,
    highlight_type,
    operation_type
  ) { },
  init_selection: function (is_clear_sel_objects) { },
  onChangeConfig: function (event) { },
  onChangeVisibility: function (event) { },
  onCommandAction: function (event) { },
  setUiStates: function (zoomInUiStates) { },

  update_buffers: function (
    update_list,
    is_apply_history,
    is_apply_revert
  ) { },
  update_clusters: function (
    update_list,
    is_apply_history,
    is_apply_revert
  ) { },
  update_disable_segment: function (
    data,
    operation,
    disabled_segment_id,
    is_skip_rendering // NOTE default false
  ) { },
  update_groups: function (
    update_list,
    is_apply_history,
    is_apply_revert
  ) { },
  update_mtls: function (
    update_list,
    is_apply_history,
    is_apply_revert
  ) { },
  update_segment_svg: function (
    data,
    dom_css, // NOTE not using in function
    excluded_segments,
    is_path_change
  ) { },
  update_segments: function (
    update_list,
    is_apply_history,
    is_apply_revert
  ) { },
  update_stations: function (
    update_list,
    is_apply_history,
    is_apply_revert
  ) { },
  update_vehicles: function (
    vehicleUpdates,
    operation,
    vehicleId, // discard
    is_skip_rendering // discard
  ) {
    vehicleUpdates.forEach(update => {
      const vehicle = findVehicleById(update.id)
      if (operation === "INSERT") {
        vehicles.value.push(update)
      } else if (operation === "UPDATE" && vehicle) {
        for (const property in update) {
          // @ts-ignore
          vehicle[property] = update[property]
        }
        // not typed real values. Why????
        // v.distanceTotal = update.distanceTotal
        // v.railIn = update.railIn
        // v.runtimeTotal = update.runtimeTotal
      } else {
        // opertaion === "DELETE"
      }
    })
    return {}
  },
}
const exposedProxy = makeFsProxy(exposed)
defineExpose(exposedProxy)

</script>

<template>
  <div
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
    <Minimap
      class="absolute"
      :style="{
        bottom: '2vw',
        left: '2vw',
        width: '14vw',
        height: '8vw',
      }"
    />
  </div>
</template>

<!-- https://v3.vuejs.org/api/sfc-spec.html#src-imports -->
<!-- https://github.com/vuejs/vue-next/issues/4662 -->
<!-- https://v3.vuejs.org/guide/web-components.html#sfc-as-custom-element -->
<style src="./styles/utility.css"></style>
<style src="./styles/zoom.css"></style>
<style src="./styles/pan.css"></style>

<!-- Plan B -->
<!-- https://stackoverflow.com/questions/69797635/how-do-i-create-a-vue-3-custom-element-including-child-component-styles -->