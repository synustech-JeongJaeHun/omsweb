<script setup lang="ts">
import { ref } from 'vue';
import { IOmsTrackMonitor } from './legacies/IOmsTrackMonitor';
import { UiStates } from './legacies/models/setting.model';
import { makeFsProxy } from './utils/devMode';

const props = defineProps<{
  text: string
}>()

const emit = defineEmits<{
  (e: "apple", value: "A"): void
  (e: "blue", value: { B: number }): void
}>()

const exposed: IOmsTrackMonitor = {
  construct: function (mode, trackSvgId, minimapSvgId, dataSvc, stateSvc) {
  },
  adjust_floaters: function () { },
  applyAfterSnapshotUpdated: function (updatedPropList) { },
  applyUpdatedExpectedPath: function () { },
  create_track: function (data) { },
  destroy: function () { },
  get_selected_objects: function (object_type) { return [] },
  getUiStates: function () { return new UiStates() },
  hasShownLayoutObjects: function (objectType, objectId) { return true },
  highlight: function (
    object_type,
    object_id,
    object_css,
    group_type,
    highlight_type,
    operation_type,
  ) { },
  init_selection: function (is_clear_sel_objects) { },
  onChangeConfig: function (event) { },
  onChangeVisibility: function (event) { },
  onCommandAction: function (event) { },
  setUiStates: function (zoomInUiStates) { },
  setup: function (
    preferences,
    can_manage_orders,
    can_manage_vehicles,
    can_modify_display_settings,
  ) { },
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
  <button type="button" @click="emit('apple', 'A')">A</button>
  <button type="button" @click="emitB($event)">B</button>
  <input type="text" v-model="props.text" />
</template>

<style scoped>
button {
  margin-left: 100px;
}
</style>