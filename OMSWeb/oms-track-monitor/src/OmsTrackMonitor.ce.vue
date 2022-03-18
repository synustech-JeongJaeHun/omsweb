<script setup lang="ts">
import { computed, provide, readonly, ref, toRefs, watch } from 'vue'
import { makeFsProxy } from './utils/devMode'
import { IOmsTrackMonitor } from './types/IOmsTrackMonitor'
import Map from 'src/MapObjects/map/components/Map.ce.vue'
import Minimap from 'src/MapObjects/minimap/components/Minimap.ce.vue'
import {
  parseNumberProp,
  parseBooleanProp,
  parseStringProp,
} from './utils/props'
import ScaleBar from 'src/MapObjects/scale/component/ScaleBar.ce.vue'
import { RootEmitInjectionKey, RootEmits } from './types/RootEmits'
import ScreenDetail from 'MapObjects/map/components/ScreenDetail.ce.vue'
import {
  initCameraAndRotation,
  centerZoom,
  getCameraAndRotation,
  approachTo,
} from 'MapObjects/cameraAndRotation'
import { ViewMode } from './types/ViewMode'
import { MapType } from './types/MapType'
import {
  ColorDefault,
  ScaleDefault,
  scaleStylesInfo,
  visibleStylesInfo,
  updateScaleStyle,
  updateVisibleStyle,
} from './styles/styles'
import { Boolish, Numberlish, Stringlish } from './types/Prop'
import { getPositionForBufferOrStation } from './TrackObjects/utils/locationStationBuffer'
import { createPathElement } from './utils/svg/path'
import {
  setElementRect,
  elementRectInfo,
} from './MapObjects/map/elementRect'
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
import {
  deleteVehicle,
  findVehicleById,
  initVehicles,
  setVehicle,
} from './TrackObjects/vehicle/vehicles'
import {
  deleteSegmentDisabled,
  initSegmentDisableds,
  insertSegmentDisabled,
} from './TrackObjects/segment/segmentDisableds'
import { makeGroups } from './TrackObjects/group/utils/group'
import { groups } from './TrackObjects/group/groups'
import { makeSegmentsFromParts } from './TrackObjects/segment/utils/segment'
import { makeClustersFromSegments } from './TrackObjects/cluster/utils/cluster'
import { setFocusedObject } from 'src/MapObjects/focus/focus'
import { scaleInfo } from './MapObjects/scale/scale'
import { rotationInfo } from './MapObjects/rotate/rotate'
import { setTrackedObject } from './MapObjects/track/track'

/**
 *  ttps://v3.vuejs.org/api/sfc-script-setup.html#typescript-only-features
 *
 *  urrently complex types and type imports from other files are not supported. It is theoretically possible to support type imports in the future.
 *
 *  s of now, the type declaration argument must be one of the following to ensure correct static analysis:
 *   A type literal
 *   A reference to an interface or a type literal in the same file
 */
const props = defineProps<{
  // enums
  viewMode: ViewMode // not implemented
  mapType: MapType // not implemented

  // rect
  width: Numberlish
  height: Numberlish

  // rotation
  rotation: Numberlish

  // scale
  vehicleSize: Numberlish // TODO
  segmentWidth: Numberlish
  segmentDirectionSize: Numberlish

  // visible
  isMinimapVisible: Boolish
  isVehicleLineVisible: Boolish
  isSegmentDirectionVisible: Boolish
  isPointLabelVisible: Boolish
  isStationVisible: Boolish
  isBufferVisible: Boolish
  isGroupVisible: Boolish
  isClusterVisible: Boolish

  // color
  backgroundColor: Stringlish
  stationColor: Stringlish
  bufferColor: Stringlish
  pointColor: Stringlish
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
watch(propRefs.rotation, () => {
  rotate(parseNumberProp(0, props.rotation))
})

// scale
watch(propRefs.vehicleSize, (n) => {
  updateScaleStyle(
    'vehicleSize',
    parseNumberProp(ScaleDefault.vehicleSize, n)
  )
})
watch(propRefs.segmentWidth, (n) => {
  updateScaleStyle(
    'segmentWidth',
    parseNumberProp(ScaleDefault.segmentWidth, n)
  )
})
watch(propRefs.segmentDirectionSize, (n) => {
  updateScaleStyle(
    'segmentDirection',
    parseNumberProp(ScaleDefault.segmentDirection, n)
  )
})

// visibility
watch(propRefs.isMinimapVisible, (b) => {
  updateVisibleStyle('minimap', parseBooleanProp(true, b))
})
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

interface Emits extends RootEmits {}
const emit = defineEmits<Emits>()
provide(RootEmitInjectionKey, readonly(emit))
// HOW TO USE
// const emit = inject<RootEmits>(RootEmitInjectionKey)!

const selfElement = ref<HTMLDivElement>()
const shadowRoot = computed(
  () => selfElement.value?.parentNode as ShadowRoot | null | undefined
)
provide('shadowRoot', readonly(shadowRoot))
// HOW TO USE
// const shadowRoot = inject<Ref<ShadowRoot>>('shadowRoot')

const exposed: IOmsTrackMonitor = {
  getCameraAndRotation,

  setTrack(t) {
    const { minX, minY, maxX, maxY } = calculateMinMaxXYFromPoints(
      t.points ?? []
    )
    initMapSizeProperties(minX, minY, maxX, maxY)

    // Order is IMPORTANT!
    // point must be initialized first.
    points.value = t.points ?? []
    buffers.value = t.buffers ?? []
    mtls.value = t.mtls ?? []
    segments.value = makeSegmentsFromParts(t.segmentParts ?? [])
    clusters.value = makeClustersFromSegments(
      t.clusters ?? [],
      segments.value
    )
    stations.value = t.stations ?? []
    zcus.value = t.zcus ?? []
    // vehicles.value = t.vehicles ?? []
    initVehicles(t.vehicles ?? [])
    initSegmentDisableds(t.segmentDisabled ?? [])
    groups.value = makeGroups(t.groups ?? [])

    // timeout for vue reactive state stabilized
    setTimeout(initCameraAndRotation, 10)
  },
  centerZoom,

  find(type, id) {
    switch (type.trim().toLowerCase()) {
      case 'vehicle':
        const vehicle = findVehicleById(id)
        if (vehicle) this.find('point', vehicle.curPoint)
        break
      case 'point':
        const point = findPointById(id)
        if (point) {
          approachTo({ x: point.x, y: point.y })
        }
        break
      case 'segment':
        const segment = findSegmentById(id)
        if (segment) {
          const path = createPathElement(segment.d)
          const position = path.getPointAtLength(path.getTotalLength() / 2)

          approachTo(position)
        }
        break
      case 'station':
        const station = findStationById(id)
        if (station) {
          const position = getPositionForBufferOrStation(station)

          if (position) approachTo(position)
        }
        break
      case 'buffer':
        const buffer = findBufferById(id)
        if (buffer) {
          const position = getPositionForBufferOrStation(buffer)

          if (position) approachTo(position)
        }
        break
      case 'mtl':
        const mtl = findMtlById(id)
        if (mtl) this.focus('point', mtl.pointId)
        break

      default:
        break
    }
  },

  focus(type, id) {
    switch (type.trim().toLowerCase()) {
      case 'vehicle':
        const vehicle = findVehicleById(id)
        if (vehicle) {
          setFocusedObject(vehicle)
        }
        break
      case 'point':
        const point = findPointById(id)
        if (point) {
          setFocusedObject(point)
        }
        break
      case 'segment':
        const segment = findSegmentById(id)
        if (segment) {
          setFocusedObject(segment)
        }
        break
      case 'station':
        const station = findStationById(id)
        if (station) {
          setFocusedObject(station)
        }
        break
      case 'buffer':
        const buffer = findBufferById(id)
        if (buffer) {
          setFocusedObject(buffer)
        }
        break
      case 'mtl':
        const mtl = findMtlById(id)
        if (mtl) {
          setFocusedObject(mtl)
        }
      case 'zcu':
        const zcu = findZcuById(id)
        if (zcu) {
          setFocusedObject(zcu)
        }

        break

      default:
        break
    }
  },
  dropFocus() {
    setFocusedObject(undefined)
  },

  track(type, id) {
    // there is only vehicle.

    const vehicle = findVehicleById(id)
    if (vehicle) {
      setTrackedObject(vehicle)
    }
  },
  stopTrack() {
    setTrackedObject(undefined)
  },

  updateVehicle(op, v) {
    switch (op) {
      case 'INSERT':
      case 'UPDATE':
        setVehicle(v)
        break

      case 'DELETE':
        deleteVehicle(v)
        break
    }
  },
  updateSegmentDisabled(op, sd) {
    switch (op) {
      case 'INSERT':
        if (sd.operation === 'INSERT') insertSegmentDisabled(sd.data)
        break
      case 'DELETE':
        deleteSegmentDisabled(sd.id)
        break
    }
  },
  updateZcu(op, z) {
    const zcu = findZcuById(z.id)
    switch (op) {
      case 'UPDATE':
        if (zcu) updateExistZcu(zcu, z)
        break
      case 'DELETE':
        if (zcu) {
          const index = zcus.value.indexOf(zcu)
          zcus.value.splice(index, 1)
        }
      default:
        break
    }
  },
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
    <Minimap class="absolute" style="bottom: 2vw; left: 2vw" />
    <div
      class="absolute flex flex-row"
      style="padding: unset; bottom: 10px; right: 10px"
    >
      <ScaleBar />
      <ScreenDetail />
    </div>
  </div>
</template>

<style>
/* dynamic css */
/* Configurable Color Start */
#layer-container {
  background-color: v-bind(
    'parseStringProp(ColorDefault.background, props.backgroundColor)'
  );
}

#station-layer .station .station-path {
  stroke: v-bind(
    'parseStringProp(ColorDefault.station, props.stationColor)'
  );
}

#buffer-layer .buffer .buffer-path {
  stroke: v-bind(
    'parseStringProp(ColorDefault.buffer, props.bufferColor)'
  );
}

#point-layer .point .point-path {
  stroke: v-bind('parseStringProp(ColorDefault.point, props.pointColor)');
  fill: v-bind('parseStringProp(ColorDefault.point, props.pointColor)');
}

#segment-layer .segment .segment-path {
  stroke: v-bind(
    'parseStringProp(ColorDefault.normalSegment, props.normalSegmentColor)'
  );
}

#segment-layer .segment[data-is-disabled='true' i] .segment-path {
  stroke: v-bind(
    'parseStringProp(ColorDefault.disabledSegment, props.disabledSegmentColor)'
  );
}

#segment-layer .segment .segment-direction {
  stroke: v-bind(
    'parseStringProp(ColorDefault.segmentDirection, props.segmentDirectionColor)'
  );
  fill: v-bind(
    'parseStringProp(ColorDefault.segmentDirection, props.segmentDirectionColor)'
  );
}

#vehicle-layer .vehicle-symbol .vehicle-mode-path {
  /* mode === none */
  fill: v-bind(
    'parseStringProp(ColorDefault.noneModeVehicle, props.noneModeVehicleColor)'
  );
}

#vehicle-layer .vehicle-symbol[data-mode='A' i] .vehicle-mode-path {
  /* mode === auto */
  fill: v-bind(
    'parseStringProp(ColorDefault.autoModeVehicle, props.autoModeVehicleColor)'
  );
}

#vehicle-layer .vehicle-symbol[data-mode='M' i] .vehicle-mode-path {
  /* mode === manual */
  fill: v-bind(
    'parseStringProp(ColorDefault.manualModeVehicle, props.manualModeVehicleColor)'
  );
}

#vehicle-layer .cargo-loading {
  fill: v-bind(
    'parseStringProp(ColorDefault.cargoLoading, props.cargoLoadingColor)'
  );
}
#vehicle-layer .cargo-full {
  fill: v-bind(
    'parseStringProp(ColorDefault.cargoFull, props.cargoFullColor)'
  );
}
#vehicle-layer .cargo-unloading {
  fill: v-bind(
    'parseStringProp(ColorDefault.cargoUnloading, props.cargoUnloadingColor)'
  );
}
/* Configurable Color End */

/* Configurable Visibility Start */
#vehicle-layer .line {
  visibility: v-bind(
    "visibleStylesInfo.vehicleLine ? 'initial' : 'hidden'"
  );
}

#segment-layer .segment-direction {
  visibility: v-bind(
    "visibleStylesInfo.segmentDirection ? 'initial' : 'hidden'"
  );
}

#station-layer {
  visibility: v-bind("visibleStylesInfo.station ? 'initial' : 'hidden'");
}

#buffer-layer {
  visibility: v-bind("visibleStylesInfo.buffer ? 'initial' : 'hidden'");
}

#cluster-layer {
  visibility: v-bind("visibleStylesInfo.cluster ? 'initial' : 'hidden'");
}

#minimap-container {
  visibility: v-bind("visibleStylesInfo.minimap ? 'initial' : 'hidden'");
}

#point-layer .label {
  visibility: v-bind(
    "visibleStylesInfo.pointLabel ? 'initial' : 'hidden'"
  );
}

.group-shadow {
  visibility: v-bind("visibleStylesInfo.group ? 'initial' : 'hidden'");
}
/* Configurable Visibility End */

/* Configurable Scale Start */
#vehicle-layer .vehicle-symbol .scale-and-reverse-rotate {
  /* transform */
  transform: scale(
      v-bind('scaleInfo.mmPerPixel * scaleStylesInfo.vehicleSize * 1/10')
    )
    rotate(var(--reverse-rotation-degree));
}

#segment-layer .segment-path {
  stroke-width: v-bind('scaleStylesInfo.segmentWidth');
}

#segment-layer .focus {
  stroke-width: v-bind('scaleStylesInfo.segmentWidth * 3');
}

#cluster-layer .cluster {
  stroke-width: v-bind('scaleStylesInfo.segmentWidth * 2.2');
}
/* Configurable Scale End */

.scale-and-reverse-rotate {
  --reverse-rotation-degree: v-bind('`${rotationInfo * (-1)}deg`');
  --mm-per-pixel: v-bind('scaleInfo.mmPerPixel');
}

:hover {
  --filter-size: v-bind('`${scaleInfo.mmPerPixel * 10}px`');
}
</style>

<!-- https://v3.vuejs.org/api/sfc-spec.html#src-imports -->
<!-- https://github.com/vuejs/vue-next/issues/4662 -->
<!-- https://v3.vuejs.org/guide/web-components.html#sfc-as-custom-element -->

<!-- MapObjects -->
<!-- Map > common -->
<style src="./MapObjects/styles/pan.css"></style>
<style src="./MapObjects/styles/rotate.css"></style>
<style src="./MapObjects/styles/will-change.css"></style>
<!-- <style src="./MapObjects/styles/will-change.css"></style> -->

<!-- TrackObjects -->
<!-- Track > common -->
<style src="./TrackObjects/styles/focus.css"></style>
<style src="./TrackObjects/styles/hover.css"></style>
<style src="./TrackObjects/styles/visibility.css"></style>
<!-- Track > buffer -->
<style src="./TrackObjects/buffer/styles/focus.css"></style>
<style src="./TrackObjects/buffer/styles/hover.css"></style>
<style src="./TrackObjects/buffer/styles/visibility.css"></style>
<style src="./TrackObjects/buffer/styles/transform.css"></style>
<!-- Track > cluster -->
<style src="./TrackObjects/cluster/styles/focus.css"></style>
<style src="./TrackObjects/cluster/styles/hover.css"></style>
<style src="./TrackObjects/cluster/styles/visibility.css"></style>
<!-- Track > group -->
<style src="./TrackObjects/group/styles/focus.css"></style>
<style src="./TrackObjects/group/styles/hover.css"></style>
<style src="./TrackObjects/group/styles/visibility.css"></style>
<!-- Track > mtl -->
<style src="./TrackObjects/mtl/styles/focus.css"></style>
<style src="./TrackObjects/mtl/styles/hover.css"></style>
<style src="./TrackObjects/mtl/styles/visibility.css"></style>
<style src="./TrackObjects/mtl/styles/transform.css"></style>
<!-- Track > point -->
<style src="./TrackObjects/point/styles/focus.css"></style>
<style src="./TrackObjects/point/styles/hover.css"></style>
<style src="./TrackObjects/point/styles/visibility.css"></style>
<style src="./TrackObjects/point/styles/transform.css"></style>
<!-- Track > segment -->
<style src="./TrackObjects/segment/styles/focus.css"></style>
<style src="./TrackObjects/segment/styles/hover.css"></style>
<style src="./TrackObjects/segment/styles/visibility.css"></style>
<!-- Track > station -->
<style src="./TrackObjects/station/styles/focus.css"></style>
<style src="./TrackObjects/station/styles/hover.css"></style>
<style src="./TrackObjects/station/styles/visibility.css"></style>
<style src="./TrackObjects/station/styles/transform.css"></style>
<!-- Track > vehicle -->
<style src="./TrackObjects/vehicle/styles/focus.css"></style>
<style src="./TrackObjects/vehicle/styles/hover.css"></style>
<style src="./TrackObjects/vehicle/styles/visibility.css"></style>
<!-- Track > zcu -->
<style src="./TrackObjects/zcu/styles/focus.css"></style>
<style src="./TrackObjects/zcu/styles/hover.css"></style>
<style src="./TrackObjects/zcu/styles/visibility.css"></style>
<style src="./TrackObjects/zcu/styles/transform.css"></style>

<!-- Common -->
<style src="./styles/sheets/utility.css"></style>
<style src="./styles/sheets/invert.css"></style>
<style src="./styles/sheets/fixed-scale.css"></style>

<!-- Plan B -->
<!-- https://stackoverflow.com/questions/69797635/how-do-i-create-a-vue-3-custom-element-including-child-component-styles -->
