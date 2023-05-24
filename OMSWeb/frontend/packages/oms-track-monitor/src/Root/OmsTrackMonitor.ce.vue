<script setup lang="ts">
import { computed, provide, readonly, ref, toRefs, watch } from 'vue'
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
  ColorDefault,
  ScaleDefault,
  VisibleDefault,
  scaleStylesInfo,
  updateScaleStyle,
} from '../styles/styles'
import { Boolish, Numberlish, Stringlish } from './types/Prop'
import {
  setElementRect,
  elementRectInfo,
} from '../MapObjects/map/elementRect'
import {
  updateVehicleSecondaryContent
} from '../TrackObjects/vehicle/vehicleSecondaryContent'
import { scaleInfo } from '../MapObjects/scale/scale'
import { rotationInfo } from '../MapObjects/rotate/rotate'
import { exposed } from './exposed'
import ZoomLayer from 'MapObjects/zoomButton/ZoomLayer.ce.vue'
import {updatePointType} from "TrackObjects/point/pointType";
import {updateNextLine, updateVHLArrow, updateVHLPosition, updateVHLAlias} from "TrackObjects/vehicle/vehicles";
import {updateIncludesWords} from "TrackObjects/station/stations";
import {updateIsBackdrop} from "TrackObjects/backdrop/backdrops"

/**
 *  https://v3.vuejs.org/api/sfc-script-setup.html#typescript-only-features
 *
 *  Currently complex types and type imports from other files are not supported. It is theoretically possible to support type imports in the future.
 *
 *  As of now, the type declaration argument must be one of the following to ensure correct static analysis:
 *    A type literal
 *    A reference to an interface or a type literal in the same file
 */
const props = defineProps<{
  // rect
  width: Numberlish
  height: Numberlish
  // scale
  vehicleSize: Numberlish
  vehicleTextSize: Numberlish
  zcuSize: Numberlish
  segmentWidth: Numberlish
  lineWidth: Numberlish
  segmentDirectionSize: Numberlish
  stationMargin: Numberlish
  bufferMargin: Numberlish
  // visible
  isMinimapVisible: Boolish
  isVehicleNextLineVisible: Boolish
  isVehicleFromOrderLineVisible: Boolish
  isVehicleToOrderLineVisible: Boolish
  isVehicleMoveOrderLineVisible: Boolish
  isVehicleHomeivrLineVisible: Boolish
  isSegmentDirectionVisible: Boolish
  isPointLabelVisible: Boolish
  isPointHomeVisible: Boolish
  isStationVisible: Boolish
  isBufferVisible: Boolish
  isZcuVisible: Boolish
  isGroupVisible: Boolish
  isClusterVisible: Boolish
  isCpsVisible: Boolish
  isFireshutterVisible: Boolish
  isMtlVisible: Boolish
  isBackdropVisible: Boolish
  zoomButtonVisible: Boolish
  pointDisplayType: Boolish

  isVHLArrowVisible: Boolish
  nextLine: Boolish
  vhlAlias: Stringlish
  // color
  backgroundColor: Stringlish
  stationColor: Stringlish
  stationDisabledColor: Stringlish
  bufferColor: Stringlish
  bufferDisabledColor: Stringlish
  pointColor: Stringlish
  homeColor: Stringlish
  normalSegmentColor: Stringlish
  disabledSegmentColor: Stringlish
  disabledByVehicleSegmentColor: Stringlish
  disabledByMTLSegmentColor: Stringlish
  segmentDirectionColor: Stringlish

  // chjs visual start
  disconnectModeVehicleColor: Stringlish
  errorModeVehicleColor: Stringlish
  maintenanceModeVehicleColor: Stringlish
  manualModeVehicleColor: Stringlish
  idleModeVehicleColor: Stringlish
  homeIvrModeVehicleColor: Stringlish
  runningModeVehicleColor: Stringlish
  zcuBlockedVehicleColor: Stringlish
  sensorStoppedVehicleColor: Stringlish
  // chjs visual end

  cargoLoadingColor: Stringlish
  cargoFullColor: Stringlish
  cargoUnloadingColor: Stringlish
  fireshutterOpenedColor: Stringlish
  fireshutterClosedColor: Stringlish
  mtlUnuseColor: Stringlish
  mtlUseColor: Stringlish
  // content
  vehicleSecondaryContent: Stringlish

  vhlDisplay: Stringlish
  includesWords: Stringlish[]
}>()
const propRefs = toRefs(props)
interface Emits extends RootEmits { }
const emit = defineEmits<Emits>()
provide(RootEmitInjectionKey, readonly(emit))
// HOW TO USE
// const emit = inject<RootEmits>(RootEmitInjectionKey)!
  
// rect
watch([propRefs.width, propRefs.height], () => {
  const width = parseNumberProp(0, props.width)
  const height = parseNumberProp(0, props.height)
  if (width > 0 && height > 0) setElementRect(width, height)
})
// scale
watch(propRefs.vehicleSize, (n) => {
  updateScaleStyle(
    'vehicleSize',
    parseNumberProp(ScaleDefault.vehicleSize, n)
  )
})
watch(propRefs.vehicleTextSize, (n) => {
  updateScaleStyle(
      'vehicleTextSize',
      parseNumberProp(ScaleDefault.vehicleTextSize, n)
  )
})
watch(propRefs.zcuSize, (n) => {
  updateScaleStyle(
    'zcuSize',
    parseNumberProp(ScaleDefault.zcuSize, n)
  )
})
watch(propRefs.segmentWidth, (n) => {
  updateScaleStyle(
    'segmentWidth',
    parseNumberProp(ScaleDefault.segmentWidth, n)
  )
})

watch(propRefs.lineWidth, (n) => {
  updateScaleStyle(
      'lineWidth',
      parseNumberProp(ScaleDefault.lineWidth, n)
  )
})
watch(propRefs.segmentDirectionSize, (n) => {
  updateScaleStyle(
    'segmentDirection',
    parseNumberProp(ScaleDefault.segmentDirection, n)
  )
})
watch(propRefs.stationMargin, (n) => {
  updateScaleStyle(
    'stationMargin',
    parseNumberProp(ScaleDefault.stationMargin, n)
  )
})
watch(propRefs.bufferMargin, (n) => {
  updateScaleStyle(
    'bufferMargin',
    parseNumberProp(ScaleDefault.bufferMargin, n)
  )
})
// content
watch([propRefs.vehicleSecondaryContent], () => {
  const vehicleSecondaryContent =
    props.vehicleSecondaryContent === 'carrier' ? 'carrier' : "order"
  updateVehicleSecondaryContent(vehicleSecondaryContent)
})
let zoomVisible =false
watch([propRefs.zoomButtonVisible], () => {
  if(props.zoomButtonVisible === true){
    zoomVisible = true
  }
  if(props.zoomButtonVisible === false){
    zoomVisible = false
  }
})

watch(propRefs.pointDisplayType, () => {
  if(typeof props.pointDisplayType === 'string'){
    updatePointType(props.pointDisplayType)
  }
})


watch(propRefs.vhlDisplay, () => {
  if(props.vhlDisplay){
    updateVHLPosition(props.vhlDisplay)
  }
})
watch(propRefs.isVHLArrowVisible, () => {
  if(typeof props.isVHLArrowVisible === 'boolean'){
    updateVHLArrow(props.isVHLArrowVisible)
  }
})
watch(propRefs.nextLine, ()=>{
  if(typeof props.nextLine === 'boolean'){
    updateNextLine(props.nextLine)
  }
})
watch(propRefs.vhlAlias, ()=>{
  if(typeof props.vhlAlias === 'string'){
    updateVHLAlias(props.vhlAlias)
  }
})
watch(propRefs.includesWords, () => {
  if(props.includesWords?.length>0){
    updateIncludesWords(props.includesWords)
  }
})
watch(propRefs.isBackdropVisible, ()=>{
  if(typeof props.isBackdropVisible === 'boolean'){
    updateIsBackdrop(props.isBackdropVisible)
  }
})

const selfElement = ref<HTMLDivElement>()
const shadowRoot = computed(
  () => selfElement.value?.parentNode as ShadowRoot | null | undefined
)

provide('shadowRoot', readonly(shadowRoot))
// HOW TO USE
// const shadowRoot = inject<Ref<ShadowRoot>>('shadowRoot')
// # development
// const exposedProxy = makeFsProxy(exposed)
// defineExpose(exposedProxy)
// # production
defineExpose(exposed)
</script>
<template>
  <div ref="selfElement" class="relative" :style="{
    width: `${elementRectInfo.width}px`,
    height: `${elementRectInfo.height}px`,
  }">
    <Map class="absolute" :style="{
      top: 0,
      left: 0,
      width: `${elementRectInfo.width}px`,
      height: `${elementRectInfo.height}px`,
    }" />
    <Minimap class="absolute" style="bottom: 45px; left: 45px" />
    <div class="absolute flex flex-row" style="
        padding: unset;
        bottom: 10px;
        right: 10px;
        align-items: center;
      ">
      <ScaleBar />
      <ScreenDetail />
    </div>
    <ZoomLayer v-show="zoomVisible" class="absolute flex flex-row" style="
        padding: unset;
        top: 10px;
        right: 10px;
        align-items: center;
      "/>
  </div>
</template>
<style>
/* dynamic css */
/* Configurable Color Start */
#layer-container {
  background-color: v-bind('parseStringProp(ColorDefault.background, props.backgroundColor)'
    );
}

#station-layer .station .station-path {
  stroke: v-bind('parseStringProp(ColorDefault.station, props.stationColor)'
    );
}

#station-layer .station[data-state='1' i] .station-path {
  stroke: #87CEEB
}
#station-layer .station[data-state='2' i] .station-path {
  stroke: #FFB2FF
}
#station-layer .station[data-disabled='true' i] .station-path {
  stroke: v-bind('parseStringProp(ColorDefault.stationDisabled, props.stationDisabledColor)'
    );
}

#buffer-layer .buffer .buffer-path {
  stroke: v-bind('parseStringProp(ColorDefault.buffer, props.bufferColor)'
    );
}

#buffer-layer .buffer[data-state='1' i] .buffer-path {
  stroke: #87CEEB
}
#buffer-layer .buffer[data-state='2' i] .buffer-path {
  stroke: #FFB2FF
}

#buffer-layer .buffer[data-disabled='true' i] .buffer-path {
  stroke: v-bind('parseStringProp(ColorDefault.bufferDisabled, props.bufferDisabledColor)'
    );
}

#buffer-layer .buffer .buffer-full {
  fill: v-bind('parseStringProp(ColorDefault.cargoFull, props.cargoFullColor)'
    );
}

#point-layer .point .point-path {
  stroke: v-bind('parseStringProp(ColorDefault.point, props.pointColor)');
  fill: v-bind('parseStringProp(ColorDefault.point, props.pointColor)');
}

#point-layer .point .home .home-path {
  fill: v-bind('parseStringProp(ColorDefault.home, props.homeColor)');
}

#segment-layer .segment .segment-path {
  stroke: v-bind('parseStringProp(ColorDefault.normalSegment, props.normalSegmentColor)'
    );
}

#disabled-segment-layer .segment .segment-path {
  stroke: v-bind('parseStringProp(ColorDefault.disabledSegment, props.disabledSegmentColor)'
    );
}

#disabled-segment-layer .segment[data-is-disabled-by-vehicle='true' i] .segment-path {
  stroke: v-bind('parseStringProp(ColorDefault.disabledByVehicleSegment, props.disabledByVehicleSegmentColor)'
    );
}

#disabled-segment-layer .segment[data-is-disabled-by-mtl='true' i] .segment-path {
  stroke: v-bind('parseStringProp(ColorDefault.disabledByMTLSegment, props.disabledByMTLSegmentColor)'
  );
}

#disabled-segment-layer .segment-path,
#disabled-segment-layer .segment[data-is-disabled-by-mtl='true' i][data-is-disabled-by-vehicle='true' i] .segment-path {
  stroke: v-bind('parseStringProp(ColorDefault.normalSegment, props.normalSegmentColor)'
    );
}

#segment-layer .segment .segment-direction,
#disabled-segment-layer .segment .segment-direction {
  stroke: v-bind('parseStringProp(ColorDefault.segmentDirection, props.segmentDirectionColor)'
    );
  fill: v-bind('parseStringProp(ColorDefault.segmentDirection, props.segmentDirectionColor)'
    );
}

/**
#vehicle-layer .vehicle-symbol .vehicle-mode-path {
  fill: v-bind(
    'parseStringProp(ColorDefault.noneModeVehicle, props.noneModeVehicleColor)'
  );
}
#vehicle-layer .vehicle-symbol[data-mode='A' i] .vehicle-mode-path {
  fill: v-bind(
    'parseStringProp(ColorDefault.autoModeVehicle, props.autoModeVehicleColor)'
  );
}
#vehicle-layer .vehicle-symbol[data-mode='M' i] .vehicle-mode-path {
  fill: v-bind(
    'parseStringProp(ColorDefault.manualModeVehicle, props.manualModeVehicleColor)'
  );
}
*/

#vehicle-layer .vehicle-symbol[data-complicated-mode='DISCONNECT' i] .vehicle-mode-path {
  fill: v-bind('parseStringProp(ColorDefault.disconnectModeVehicleColor, props.disconnectModeVehicleColor)'
    );
}

#vehicle-layer .vehicle-symbol[data-complicated-mode='ERROR' i] .vehicle-mode-path {
  fill: v-bind('parseStringProp(ColorDefault.errorModeVehicleColor, props.errorModeVehicleColor)'
    );
}

#vehicle-layer .vehicle-symbol[data-complicated-mode='MAINTENANCE' i] .vehicle-mode-path {
  fill: v-bind('parseStringProp(ColorDefault.maintenanceModeVehicleColor, props.maintenanceModeVehicleColor)'
    );
}

#vehicle-layer .vehicle-symbol[data-complicated-mode='MANUAL' i] .vehicle-mode-path {
  fill: v-bind('parseStringProp(ColorDefault.manualModeVehicleColor, props.manualModeVehicleColor)'
    );
}

#vehicle-layer .vehicle-symbol[data-complicated-mode='IDLE' i] .vehicle-mode-path {
  fill: v-bind('parseStringProp(ColorDefault.idleModeVehicleColor, props.idleModeVehicleColor)'
    );
}

#vehicle-layer .vehicle-symbol[data-complicated-mode='HOMEIVR' i] .vehicle-mode-path {
  fill: v-bind('parseStringProp(ColorDefault.homeIvrModeVehicleColor, props.homeIvrModeVehicleColor)'
    );
}

#vehicle-layer .vehicle-symbol[data-complicated-mode='RUNNING' i] .vehicle-mode-path {
  fill: v-bind('parseStringProp(ColorDefault.runningModeVehicleColor, props.runningModeVehicleColor)'
    );
}

#vehicle-layer .vehicle-symbol[data-complicated-mode='ZCUBLOCKED' i] .vehicle-mode-path {
  fill: v-bind('parseStringProp(ColorDefault.zcuBlockedVehicleColor, props.zcuBlockedVehicleColor)'
    );
}
#vehicle-layer .vehicle-symbol[data-complicated-mode='SENSORSTOPPED' i] .vehicle-mode-path {
  fill: v-bind('parseStringProp(ColorDefault.sensorStoppedVehicleColor, props.sensorStoppedVehicleColor)'
    );
}
/* vehicle complicated fallback state is idle */
#vehicle-layer .vehicle-symbol .vehicle-mode-path {
  fill: v-bind('parseStringProp(ColorDefault.idleModeVehicleColor, props.idleModeVehicleColor)'
    );
}

#vehicle-layer .cargo-loading {
  fill: v-bind('parseStringProp(ColorDefault.cargoLoading, props.cargoLoadingColor)'
    );
}

#vehicle-layer .cargo-full {
  fill: v-bind('parseStringProp(ColorDefault.cargoFull, props.cargoFullColor)'
    );
}

#vehicle-layer .cargo-unloading {
  fill: v-bind('parseStringProp(ColorDefault.cargoUnloading, props.cargoUnloadingColor)'
    );
}

#fireshutter-layer .fireshutter.opened g {
  fill: v-bind('parseStringProp(ColorDefault.fireshutterOpened, props.fireshutterOpenedColor)'
    );
}

#fireshutter-layer .fireshutter.closed g {
  fill: v-bind('parseStringProp(ColorDefault.fireshutterClosed, props.fireshutterClosedColor)'
    );
}

#mtl-layer .mtl[data-unuse='unuse' i] .mtl-path {
  stroke: v-bind('parseStringProp(ColorDefault.mtlUnuse, props.mtlUnuseColor)'
    );
}

#mtl-layer .mtl[data-unuse='use' i] .mtl-path {
  stroke: v-bind('parseStringProp(ColorDefault.mtlUse, props.mtlUseColor)'
    );
}

/* Configurable Color End */
/* Configurable Visibility Start */
#vehicle-layer .next-line {
  visibility: v-bind("parseBooleanProp(VisibleDefault.vehicleNextLine, props.isVehicleNextLineVisible) ? 'initial' : 'hidden'"
    );
}
#vehicle-layer .from-line {
  visibility: v-bind("parseBooleanProp(VisibleDefault.vehicleFromOrderLine, props.isVehicleFromOrderLineVisible) ? 'initial' : 'hidden'"
    );
}
#vehicle-layer .to-line {
  visibility: v-bind("parseBooleanProp(VisibleDefault.vehicleToOrderLine, props.isVehicleToOrderLineVisible) ? 'initial' : 'hidden'"
    );
}
#vehicle-layer .move-line {
  visibility: v-bind("parseBooleanProp(VisibleDefault.vehicleMoveOrderLine, props.isVehicleMoveOrderLineVisible) ? 'initial' : 'hidden'"
    );
}
#vehicle-layer .homeivr-line {
  visibility: v-bind("parseBooleanProp(VisibleDefault.vehicleHomeivrLine, props.isVehicleHomeivrLineVisible) ? 'initial' : 'hidden'"
    );
}

#segment-layer .segment-direction,
#disabled-segment-layer .segment-direction {
  visibility: v-bind("parseBooleanProp(VisibleDefault.segmentDirection, props.isSegmentDirectionVisible) ? 'initial' : 'hidden'"
    );
}

#station-layer {
  visibility: v-bind("parseBooleanProp(VisibleDefault.station, props.isStationVisible) ? 'initial' : 'hidden'"
    );
}

#buffer-layer {
  visibility: v-bind("parseBooleanProp(VisibleDefault.buffer, props.isBufferVisible) ? 'initial' : 'hidden'"
    );
}

#zcu-layer {
  visibility: v-bind("parseBooleanProp(VisibleDefault.zcu, props.isZcuVisible) ? 'initial' : 'hidden'"
    );
}

#cluster-layer {
  visibility: v-bind("parseBooleanProp(VisibleDefault.cluster, props.isClusterVisible) ? 'initial' : 'hidden'"
    );
}
#cps-layer {
  visibility: v-bind("parseBooleanProp(VisibleDefault.cps, props.isCpsVisible) ? 'initial' : 'hidden'"
    );
}

#fireshutter-layer {
  visibility: v-bind("parseBooleanProp(VisibleDefault.fireshutter, props.isFireshutterVisible) ? 'initial' : 'hidden'"
    );
}

#mtl-layer {
  visibility: v-bind("parseBooleanProp(VisibleDefault.mtl, props.isMtlVisible) ? 'initial' : 'hidden'"
    );
}

#minimap-container {
  visibility: v-bind("parseBooleanProp(VisibleDefault.minimap, props.isMinimapVisible) ? 'initial' : 'hidden'"
    );
}

#point-layer .label {
  visibility: v-bind("parseBooleanProp(VisibleDefault.pointLabel, props.isPointLabelVisible) ? 'initial' : 'hidden'"
    );
}

#point-layer .home {
  visibility: v-bind("parseBooleanProp(VisibleDefault.pointHome, props.isPointHomeVisible) ? 'initial' : 'hidden'"
    );
}

.group-shadow {
  visibility: v-bind("parseBooleanProp(VisibleDefault.group, props.isGroupVisible) ? 'initial' : 'hidden'"
    );
}

/* Configurable Visibility End */
/* Configurable Scale Start */
#vehicle-layer .vehicle-symbol .scale-and-reverse-rotate {
  /* transform */
  transform: scale(v-bind('scaleInfo.mmPerPixel * scaleStylesInfo.vehicleSize * 1/10')) rotate(var(--reverse-rotation-degree));
}

#vehicle-layer .vehicle-symbol .scale-arrow {
  transform: scale(v-bind('scaleInfo.mmPerPixel * scaleStylesInfo.vehicleSize * 1/6'))
}
/*#vehicle-layer .vehicle-symbol .text {
  font-size: scale(v-bind('scaleStylesInfo.vehicleTextSize'))
}*/

#vehicle-layer .vehicle-symbol[data-carrier-focused~='true' i] .scale-and-reverse-rotate {
  /* transform */
  animation: vehicle-carrier-focused-scale-grow 1s ease-in-out forwards;
}
#vehicle-layer .vehicle-symbol[data-carrier-focused~='true' i] .scale-arrow {
  /* transform */
  animation: vehicle-carrier-focused-scale-grow 1s ease-in-out forwards;
}

@keyframes vehicle-carrier-focused-scale-grow {
  0%{
    transform:scale(v-bind('scaleInfo.mmPerPixel * scaleStylesInfo.vehicleSize * 1/10')) rotate(var(--reverse-rotation-degree))
  }
  100%{
    transform: scale(v-bind('scaleInfo.mmPerPixel * scaleStylesInfo.vehicleSize * 1/4')) rotate(var(--reverse-rotation-degree));
  }

}

#zcu-layer .zcu .scale-and-reverse-rotate {
  /* transform */
  transform: scale(
      v-bind('scaleInfo.mmPerPixel * scaleStylesInfo.zcuSize * 1/10')
    )
    rotate(var(--reverse-rotation-degree));
}

#segment-layer .segment-path,
#disabled-segment-layer .segment-path {
  stroke-width: v-bind('scaleStylesInfo.segmentWidth');
}

#vehicle-layer .line {
  stroke-width: v-bind('scaleStylesInfo.lineWidth');
}

#segment-layer .segment-path,
#disabled-segment-layer .segment-path {
  stroke-width: v-bind('scaleStylesInfo.segmentWidth');
}

#segment-layer .flr,
#disabled-segment-layer .flr  {
  stroke: rgba(0, 0, 0, 0.5);
  stroke-width: v-bind('scaleStylesInfo.segmentWidth +2.4');
}

#cluster-layer .cluster {
  stroke-width: v-bind('scaleStylesInfo.segmentWidth * 2.2');
}

#cps-layer .cps {
  stroke-width: v-bind('scaleStylesInfo.segmentWidth * 2.2');
}

/* Configurable Scale End */
.scale-and-reverse-rotate {
  --reverse-rotation-degree: v-bind('`${rotationInfo * (-1)}deg`');
  --mm-per-pixel: v-bind('scaleInfo.mmPerPixel');
}

.scale-arrow {
  --mm-per-pixel: v-bind('scaleInfo.mmPerPixel');
}


:hover {
  --filter-size: v-bind('`${scaleInfo.mmPerPixel * 10}px`');
}

.fire-legend {
	fill: #ff0000;
	animation: fire-legend 1s infinite;
}

@keyframes fire-legend {
	0% {
		transform: scale(0);
		opacity: 1;
	}

	90% {
		transform: scale(1);
		opacity: 1;
	}

	100% {
		transform: scale(1);
		opacity: 1;
	}
}
</style>
<!-- https://v3.vuejs.org/api/sfc-spec.html#src-imports -->
<!-- https://github.com/vuejs/vue-next/issues/4662 -->
<!-- https://v3.vuejs.org/guide/web-components.html#sfc-as-custom-element -->
<!-- MapObjects -->
<!-- Map > common -->
<style src="src/MapObjects/styles/pan.css">
</style>
<style src="src/MapObjects/styles/rotate.css">
</style>
<style src="src/MapObjects/styles/will-change.css">
</style>
<!-- <style src="./MapObjects/styles/will-change.css"></style> -->
<!-- Map > Scale -->
<style src="src/MapObjects/scale/styles/transform.css">
</style>
<!-- TrackObjects -->
<!-- Track > common -->
<style src="src/TrackObjects/styles/focus.css">
</style>
<style src="src/TrackObjects/styles/hover.css">
</style>
<style src="src/TrackObjects/styles/visibility.css">
</style>
<!-- Track > buffer -->
<style src="src/TrackObjects/buffer/styles/focus.css">
</style>
<style src="src/TrackObjects/buffer/styles/hover.css">
</style>
<style src="src/TrackObjects/buffer/styles/visibility.css">
</style>
<style src="src/TrackObjects/buffer/styles/transform.css">
</style>
<!-- Track > cluster -->
<style src="src/TrackObjects/cluster/styles/focus.css">
</style>
<style src="src/TrackObjects/cluster/styles/hover.css">
</style>
<style src="src/TrackObjects/cluster/styles/visibility.css">
</style>
<!-- Track > group -->
<style src="src/TrackObjects/group/styles/focus.css">
</style>
<style src="src/TrackObjects/group/styles/hover.css">
</style>
<style src="src/TrackObjects/group/styles/visibility.css">
</style>
<!-- Track > mtl -->
<style src="src/TrackObjects/mtl/styles/focus.css">
</style>
<style src="src/TrackObjects/mtl/styles/hover.css">
</style>
<style src="src/TrackObjects/mtl/styles/visibility.css">
</style>
<style src="src/TrackObjects/mtl/styles/transform.css">
</style>
<!-- Track > point -->
<style src="src/TrackObjects/point/styles/focus.css">
</style>
<style src="src/TrackObjects/point/styles/hover.css">
</style>
<style src="src/TrackObjects/point/styles/visibility.css">
</style>
<style src="src/TrackObjects/point/styles/transform.css">
</style>
<!-- Track > segment -->
<style src="src/TrackObjects/segment/styles/focus.css">
</style>
<style src="src/TrackObjects/segment/styles/hover.css">
</style>
<style src="src/TrackObjects/segment/styles/visibility.css">
</style>
<!-- Track > station -->
<style src="src/TrackObjects/station/styles/focus.css">
</style>
<style src="src/TrackObjects/station/styles/hover.css">
</style>
<style src="src/TrackObjects/station/styles/visibility.css">
</style>
<style src="src/TrackObjects/station/styles/transform.css">
</style>
<!-- Track > vehicle -->
<style src="src/TrackObjects/vehicle/styles/focus.css">
</style>
<style src="src/TrackObjects/vehicle/styles/hover.css">
</style>
<style src="src/TrackObjects/vehicle/styles/visibility.css">
</style>
<!-- Track > zcu -->
<style src="src/TrackObjects/zcu/styles/focus.css">
</style>
<style src="src/TrackObjects/zcu/styles/hover.css">
</style>
<style src="src/TrackObjects/zcu/styles/visibility.css">
</style>
<!-- Track > Fireshutter -->
<style src="src/TrackObjects/fireshutter/styles/focus.css">
</style>
<style src="src/TrackObjects/fireshutter/styles/hover.css">
</style>
<style src="src/TrackObjects/fireshutter/styles/visibility.css">
</style>
<style src="src/TrackObjects/fireshutter/styles/transform.css">
</style>

<!-- Common -->
<style src="src/styles/sheets/utility.css">
</style>
<style src="src/styles/sheets/invert.css">
</style>
<style src="src/styles/sheets/fixed-scale.css">
</style>
<!-- Plan B -->
<!-- https://stackoverflow.com/questions/69797635/how-do-i-create-a-vue-3-custom-element-including-child-component-styles -->
