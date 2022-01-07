<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ViewModes } from './legacies/Enums'
import { IOmsTrackMonitor } from './legacies/IOmsTrackMonitor'
import { IPreferences, UiStates } from './legacies/models/setting.model'
import { MapDataService } from './legacies/serivces/MapData.service'
import { MapStatesService } from './legacies/serivces/MapStates.service'
import { makeFsProxy } from './utils/devMode'

const props = defineProps<{
  width: number,
  height: number,
}>()

const emit = defineEmits<{
  (e: 'apple', value: 'A'): void
  (e: 'blue', value: { B: number }): void
}>()

// State Start

const viewMode = ref<ViewModes>('PUBLIC')
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
  adjust_floaters: function () { },
  applyAfterSnapshotUpdated: function (updatedPropList) { },
  applyUpdatedExpectedPath: function () { },
  create_track: function (data) { },
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
    raw_data,
    operation,
    vehicleId,
    is_skip_rendering
  ) {
    return { '1': {} }
  },
}

const exposedProxy = makeFsProxy(exposed)

defineExpose(exposedProxy)

function emitB(event: any) {
  emit('blue', { B: Date.now() })
}
</script>

<template>
  <div></div>
</template>

<style scoped>
div {
  width: v-bind("props.width");
  width: v-bind("props.height");
}
</style>
