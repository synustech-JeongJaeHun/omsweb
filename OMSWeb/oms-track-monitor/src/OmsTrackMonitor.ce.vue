<script setup lang="ts">
import { computed, provide, readonly, ref, toRefs, watch } from 'vue'
import { makeFsProxy } from './utils/devMode'
import { IOmsTrackMonitor } from './types/IOmsTrackMonitor'
import { IPreferences } from './legacies/models/setting.model'
import Map from 'src/MapObjects/map/components/Map.ce.vue'
import Minimap from 'src/MapObjects/minimap/components/Minimap.ce.vue'
import { parseNumberProp, parseBooleanProp, parseStringProp } from './utils/props'
import Scale from 'src/MapObjects/scale/component/Scale.ce.vue'
import { RootEmitInjectionKey, RootEmits } from './types/RootEmits'
import ScreenDetail from 'MapObjects/map/components/ScreenDetail.ce.vue'
import { initCameraAndRotation, centerZoom, getCameraAndRotation, approachToPosition } from 'MapObjects/cameraAndRotation'
import { ViewMode } from './types/ViewMode'
import { MapType } from './types/MapType'
import {
  ColorDefault,
  ScaleDefault,
  updateScaleStyle,
  updateVisibleStyle
} from './styles/styles'
import { Boolish, Numberlish, Stringlish } from './types/Prop'
import { getPositionForBufferOrStation } from './TrackObjects/utils/locationStationBuffer'
import { createPathElement } from './utils/svg/path'
import { setElementRect, elementRectInfo } from './MapObjects/map/elementRect'
import { rotate } from './MapObjects/rotate/rotate'
import { calculateMinMaxXYFromPoints } from './MapObjects/map/utils/size'
import { initMapSizeProperties } from './MapObjects/map/mapSizeProperties'
import { findPointById, points } from './TrackObjects/point/points'
import { buffers, findBufferById } from './TrackObjects/buffer/buffers'
import { findMtlById, mtls } from './TrackObjects/mtl/mtls'
import { findSegmentById, segments } from './TrackObjects/segment/segments'
import { clusters } from './TrackObjects/cluster/clusters'
import { findStationById, stations } from './TrackObjects/station/stations'
import { findZcuById, updateExistZcu, zcus } from './TrackObjects/zcu/zcus'
import { findVehicleById, updateExistVehicle, vehicles } from './TrackObjects/vehicle/vehicles'
import { deleteSegmentDisabled, initSegmentDisableds, insertSegmentDisabled } from './TrackObjects/segment/segmentDisableds'
import { makeGroups } from './TrackObjects/group/utils/group'
import { groups } from './TrackObjects/group/groups'
import { makeSegmentsFromParts } from './TrackObjects/segment/utils/segment'
import { makeClustersFromSegments } from './TrackObjects/cluster/utils/cluster'
import { setFocusedObject } from 'src/MapObjects/focus/focus'

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
  // enums
  viewMode: ViewMode, // not implemented
  mapType: MapType, // not implemented

  // rect
  width: Numberlish,
  height: Numberlish,

  // rotation
  rotation: Numberlish

  // scale
  vehicleSize: Numberlish, // TODO
  segmentWidth: Numberlish,
  segmentDirectionSize: Numberlish,

  // visible
  isMinimapVisible: Boolish,
  isVehicleLineVisible: Boolish,
  isSegmentDirectionVisible: Boolish,
  isPointLabelVisible: Boolish,
  isStationVisible: Boolish,
  isBufferVisible: Boolish,
  isGroupVisible: Boolish,
  isClusterVisible: Boolish,
  isOverlappingObjectsVisible: Boolish, // TODO

  // color
  backgroundColor: Stringlish
  playbackBackgroundColor: Stringlish
  stationColor: Stringlish
  bufferColor: Stringlish
  pointColor: Stringlish
  vehicleExpectedPathColor: Stringlish
  normalSegmentColor: Stringlish
  disabledSegmentColor: Stringlish
  segmentDirectionColor: Stringlish
  autoModeVehicleColor: Stringlish
  manualModeVehicleColor: Stringlish
  noneModeVehicleColor: Stringlish
  cargoLoadingColor: Stringlish
  cargoFullColor: Stringlish
  cargoUnloadingColor: Stringlish
}>()

const propRefs = toRefs(props)

// const viewMode = ref<ViewMode>('PUBLIC')
// const mapType = ref<MapType>('DB');

// rect
watch([propRefs.width, propRefs.height], () => {
  const width = parseNumberProp(0, props.width)
  const height = parseNumberProp(0, props.height)
  if (width > 0 && height > 0) setElementRect(width, height)
})

// rotation
watch(propRefs.rotation, () => { rotate(parseNumberProp(0, props.rotation)) })

// scale
watch(propRefs.vehicleSize, (n) => { updateScaleStyle('vehicleSize', parseNumberProp(ScaleDefault.vehicleSize, n)) })
watch(propRefs.segmentWidth, (n) => { updateScaleStyle('segmentWidth', parseNumberProp(ScaleDefault.segmentWidth, n)) })
watch(propRefs.segmentDirectionSize, (n) => { updateScaleStyle('segmentDirection', parseNumberProp(ScaleDefault.segmentDirection, n)) })

// visibility
watch(propRefs.isMinimapVisible, (b) => { updateVisibleStyle('minimap', parseBooleanProp(true, b)) })
watch(propRefs.isPointLabelVisible, (b) => {
  updateVisibleStyle('pointLabel', parseBooleanProp(true, b))
})
watch(propRefs.isStationVisible, (b) => {
  updateVisibleStyle('station', parseBooleanProp(true, b))
})
watch(propRefs.isBufferVisible, (b) => {
  updateVisibleStyle('buffer', parseBooleanProp(true, b))
})
watch(propRefs.isGroupVisible, (b) => {
  updateVisibleStyle('group', parseBooleanProp(true, b))
})
watch(propRefs.isClusterVisible, (b) => {
  updateVisibleStyle('cluster', parseBooleanProp(true, b))
})
watch(propRefs.isVehicleLineVisible, (b) => {
  updateVisibleStyle('vehicleLine', parseBooleanProp(true, b))
})
watch(propRefs.isSegmentDirectionVisible, (b) => {
  updateVisibleStyle('segmentDirection', parseBooleanProp(true, b))
})

interface Emits extends RootEmits { }
const emit = defineEmits<Emits>()
provide(RootEmitInjectionKey, readonly(emit))
// HOW TO USE
// const emit = inject<RootEmits>(RootEmitInjectionKey)!

const selfElement = ref<HTMLDivElement>()
const shadowRoot = computed(() => selfElement.value?.parentNode as ShadowRoot | null | undefined)
provide('shadowRoot', readonly(shadowRoot))
// HOW TO USE
// const shadowRoot = inject<Ref<ShadowRoot>>('shadowRoot')

// TODO handle permission on host system, not on tm
// const permissions = reactive({
//   canManageOrders: false,
//   canManageVehicles: false,
//   canManageDisplaySettings: false
// })
const preferences = ref<IPreferences>()
// State End

const exposed: IOmsTrackMonitor = {
  getCameraAndRotation,

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

  focus(type, id) {
    switch (type.trim().toLowerCase()) {
      case 'vehicle':
        const vehicle = findVehicleById(id)
        if (vehicle) {
          // setFocusedObject(vehicle)
        }
        break;
      case 'point':
        const point = findPointById(id)
        if (point) {
          setFocusedObject(point)
        }
        break;
      case 'segment':
        const segment = findSegmentById(id)
        if (segment) {
          setFocusedObject(segment)
        }
        break;
      case 'station':
        const station = findStationById(id)
        if (station) {
          setFocusedObject(station)
        }
        break;
      case 'buffer':
        const buffer = findBufferById(id)
        if (buffer) {
          setFocusedObject(buffer)
        }
        break;
      case 'mtl':
        const mtl = findMtlById(id)
        if (mtl) {
          setFocusedObject(mtl)
        }

        break;

      default:
        break;
    }
  },

  find(type, id) {
    switch (type.trim().toLowerCase()) {
      case 'vehicle':
        const vehicle = findVehicleById(id)
        // TODO
        break;
      case 'point':
        const point = findPointById(id)
        if (point) {
          approachToPosition({ x: point.x, y: point.y })
        }
        break;
      case 'segment':
        const segment = findSegmentById(id)
        if (segment) {
          const path = createPathElement(segment.d)
          const position = path.getPointAtLength(path.getTotalLength() / 2)

          approachToPosition(position)
        }
        break;
      case 'station':
        const station = findStationById(id)
        if (station) {
          const position = getPositionForBufferOrStation(station)

          if (position)
            approachToPosition(position)
        }
        break;
      case 'buffer':
        const buffer = findBufferById(id)
        if (buffer) {
          const position = getPositionForBufferOrStation(buffer)

          if (position)
            approachToPosition(position)
        }
        break;
      case 'mtl':
        const mtl = findMtlById(id)
        if (mtl) this.focus('point', mtl.pointId)

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
  }
}

// # development
// const exposedProxy = makeFsProxy(exposed)
// defineExpose(exposedProxy)

// # production
defineExpose(exposed)
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
    />
    <Minimap class="absolute" style="bottom: 2vw; left: 2vw;" />
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
<style src="./styles/sheets/visibility.css"></style>
<style src="./styles/sheets/focus.css"></style>
<style src="./styles/sheets/fixed-scale.css"></style>

<!-- dynamic css for configurable styling -->
<style>
#layer-container {
  background-color: v-bind(
    "parseStringProp(ColorDefault.background, props.backgroundColor)"
  );
}

#station-layer .station .station-path {
  stroke: v-bind("parseStringProp(ColorDefault.station, props.stationColor)");
}

#buffer-layer .buffer .buffer-path {
  stroke: v-bind("parseStringProp(ColorDefault.buffer, props.bufferColor)");
}

#point-layer .point .point-path {
  fill: v-bind("parseStringProp(ColorDefault.point, props.pointColor)");
}

#segment-layer .segment .segment-path {
  stroke: v-bind(
    "parseStringProp(ColorDefault.normalSegment, props.normalSegmentColor)"
  );
}

#segment-layer .segment[data-is-disabled="true" i] .segment-path {
  stroke: v-bind(
    "parseStringProp(ColorDefault.disabledSegment, props.disabledSegmentColor)"
  );
}

#segment-layer .segment .segment-direction {
  stroke: v-bind(
    "parseStringProp(ColorDefault.segmentDirection, props.segmentDirectionColor)"
  );
  fill: v-bind(
    "parseStringProp(ColorDefault.segmentDirection, props.segmentDirectionColor)"
  );
}

#vehicle-layer .vehicle-mode-path {
  /* mode === none */
  fill: v-bind(
    "parseStringProp(ColorDefault.noneModeVehicle, props.noneModeVehicleColor)"
  );
}

#vehicle-layer .vehicle-mode-path[data-mode="A" i] {
  /* mode === auto */
  fill: v-bind(
    "parseStringProp(ColorDefault.autoModeVehicle, props.autoModeVehicleColor)"
  );
}

#vehicle-layer .vehicle-mode-path[data-mode="M" i] {
  /* mode === manual */
  fill: v-bind(
    "parseStringProp(ColorDefault.manualModeVehicle, props.manualModeVehicleColor)"
  );
}

#vehicle-layer .cargo-loading {
  fill: v-bind(
    "parseStringProp(ColorDefault.cargoLoading, props.cargoLoadingColor)"
  );
}
#vehicle-layer .cargo-full {
  fill: v-bind("parseStringProp(ColorDefault.cargoFull, props.cargoFullColor)");
}
#vehicle-layer .cargo-unloading {
  fill: v-bind(
    "parseStringProp(ColorDefault.cargoUnloading, props.cargoUnloadingColor)"
  );
}
</style>

<!-- Plan B -->
<!-- https://stackoverflow.com/questions/69797635/how-do-i-create-a-vue-3-custom-element-including-child-component-styles -->