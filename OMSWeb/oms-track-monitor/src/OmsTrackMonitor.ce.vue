<script setup lang="ts">
import { computed, provide, reactive, readonly, ref, watch } from 'vue'
import { makeFsProxy } from './utils/devMode'
import { IOmsTrackMonitor } from './types/IOmsTrackMonitor'
import { IPreferences } from './legacies/models/setting.model'
import { buffers } from './buffer/buffers'
import { clusters } from './cluster/clusters'
import { groups } from './group/groups'
import { calculateMinMaxXYFromPoints } from './map/utils/size'
import { mtls } from './mtl/mtls'
import { points } from './point/points'
import {
  initSegmentDisableds,
  insertSegmentDisabled,
  deleteSegmentDisabled
} from './segment/segmentDisableds'
import { stations } from './station/stations'
import { findVehicleById, updateExistVehicle, vehicles } from './vehicle/vehicles'
import { findZcuById, zcus, updateExistZcu } from './zcu/zcus'
import Map from './map/components/Map.ce.vue'
import Minimap from './minimap/components/Minimap.ce.vue'
import { initMapSizeProperties } from './map/mapSizeProperties'
import { segments } from './segment/segments'
import { makeSegmentsFromParts } from './segment/utils/segment'
import { parseNumberProp, parseBooleanProp } from './utils/props'
import Scale from './scale/component/Scale.ce.vue'
import { makeClustersFromSegments } from './cluster/utils/cluster'
import { makeGroups } from './group/utils/group'
import { RootEmitInjectionKey, RootEmits } from './types/RootEmits'
import ScreenDetail from './map/components/ScreenDetail.ce.vue'
import { elementRectInfo, setElementRect } from './map/elementRect'
import { initCameraAndRotation, centerZoom } from './cameraAndRotation'
import { ViewMode } from './types/ViewMode'
import { MapType } from './types/MapType'
import { rotate } from './rotate/rotate'
import {
  updateColorStyle,
  updateScaleStyle,
  updateVisibleStyle
} from './styles/styles'

/**
 * https://v3.vuejs.org/api/sfc-script-setup.html#typescript-only-features
 * 
 * Currently complex types and type imports from other files are not supported. It is theoretically possible to support type imports in the future.
 * 
 * As of now, the type declaration argument must be one of the following to ensure correct static analysis:
 * - A type literal
 * - A reference to an interface or a type literal in the same file
 */
const props = defineProps<{
  viewMode: ViewMode,
  mapType: MapType,
  width: number | string | undefined | null,
  height: number | string | undefined | null,
  isMinimapShowing: boolean | string | undefined | null,
  isClusterShowing: boolean | string | undefined | null,
  isGroupShowing: boolean | string | undefined | null,
}>()

// const viewMode = ref<ViewMode>('PUBLIC')
// const mapType = ref<MapType>('DB');
// watching props for unstable props delivery
watch(props, (props, prevProps) => {
  const width = parseNumberProp(0, props.width)
  const height = parseNumberProp(0, props.height)
  if (width > 0 && height > 0) setElementRect(width, height)
})

interface Emits extends RootEmits { }
const emit = defineEmits<Emits>()
provide(RootEmitInjectionKey, readonly(emit))
// const emit = inject<RootEmits>(RootEmitInjectionKey)!

const selfElement = ref<HTMLDivElement>()
const shadowRoot = computed(() => selfElement.value?.parentNode as ShadowRoot | null | undefined)
provide('shadowRoot', readonly(shadowRoot))
// const shadowRoot = inject<Ref<ShadowRoot>>('shadowRoot')

const permissions = reactive({
  canManageOrders: false,
  canManageVehicles: false,
  canManageDisplaySettings: false
})
const preferences = ref<IPreferences>()
// State End

const exposed: IOmsTrackMonitor = {
  setPreference(p) { preferences.value = p },
  setTrack(t) {
    const { minX, minY, maxX, maxY } = calculateMinMaxXYFromPoints(t.points ?? [])
    initMapSizeProperties(minX, minY, maxX, maxY)

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
    initSegmentDisableds(t.segmentDisabled ?? [])
    groups.value = makeGroups(t.groups ?? [])

    // timeout for vue reactive state stabilized
    setTimeout(initCameraAndRotation, 10);
  },
  centerZoom,

  trackObject(type, id) {
    switch (type) {
      case 'Vehicle':
        // TODO
        break;

      default:
        break;
    }
  },

  updateVehicle(op, v) {
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
  // updateSegment(op, s) { },
  updateSegmentDisabled(op, sd) {
    switch (op) {
      case 'INSERT':
        if (sd.operation === 'INSERT') insertSegmentDisabled(sd.data)
        break;
      case 'DELETE':
        deleteSegmentDisabled(sd.id)
        break;
    }
  },
  updateZcu(op, z) {
    const zcu = findZcuById(z.id)
    switch (op) {
      case 'UPDATE':
        if (zcu) updateExistZcu(zcu, z)
        break;
      case 'DELETE':
        if (zcu) {
          const index = zcus.value.indexOf(zcu)
          zcus.value.splice(index, 1)
        }
      default:
        break;
    }
  },

  setMapRotation(degree) {
    rotate(degree)
  },

  updateColorStyle,
  updateScaleStyle,
  updateVisibleStyle
}

// # in devmode
// const exposedProxy = makeFsProxy(exposed)
defineExpose(exposed)
// # production
// defineExpose(exposed)

</script>

<template>
  <div
    ref="selfElement"
    class="relative"
    :style="{
      width: `${elementRectInfo.width}px`,
      height: `${elementRectInfo.height}px`,
    }"
  >
    <Map
      class="absolute"
      :style="{
        top: 0,
        left: 0,
        width: `${elementRectInfo.width}px`,
        height: `${elementRectInfo.height}px`,
      }"
      :isClusterShowing="parseBooleanProp(false, props.isClusterShowing)"
      :isGroupShowing="parseBooleanProp(false, props.isGroupShowing)"
    />
    <Minimap
      v-show="parseBooleanProp(true, props.isMinimapShowing)"
      class="absolute"
      style="bottom: 2vw; left: 2vw;"
    />
    <div class="absolute flex flex-row" style="padding: unset; bottom: 10px; right: 10px;">
      <Scale />
      <ScreenDetail />
    </div>
  </div>
</template>

<!-- https://v3.vuejs.org/api/sfc-spec.html#src-imports -->
<!-- https://github.com/vuejs/vue-next/issues/4662 -->
<!-- https://v3.vuejs.org/guide/web-components.html#sfc-as-custom-element -->
<style src="./styles/sheets/utility.css"></style>
<style src="./styles/sheets/pan.css"></style>
<style src="./styles/sheets/rotate.css"></style>
<style src="./styles/sheets/invert.css"></style>
<style src="./styles/sheets/group.css"></style>

<!-- Plan B -->
<!-- https://stackoverflow.com/questions/69797635/how-do-i-create-a-vue-3-custom-element-including-child-component-styles -->