import {reactive, readonly, ref} from 'vue'
import { deepCopy } from '../utils/deepCopy'
import { ColorProperty } from './types/ColorProperty'
import { ScaleProperty } from './types/ScaleProperty'
import { VisibleProperty } from './types/VisibleProperty'

const ScaleDefault: Record<ScaleProperty, number> = {
  vehicleSize: 10, // applied in OmsTrackMonitor.ce.vue
  vehicleTextSize: 12,
	vehiclePropSize: 12,
	stationSize: 10,
	stationTextSize: 10,
	bufferSize: 10,
	bufferTextSize: 10,
  zcuSize: 7, // applied in OmsTrackMonitor.ce.vue
  segmentDirection: 6, // applied in SegmentLayer.ce.vue
  segmentWidth: 3, // applied in OmsTrackMonitor.ce.vue
	lineWidth: 1,
  stationMargin: 300, // applied in OmsTrackMonitor.ce.vue
  bufferMargin: 300, // applied in OmsTrackMonitor.ce.vue
}
const scaleStyles = reactive(deepCopy(ScaleDefault))
const scaleStylesInfo = readonly(scaleStyles)

function updateScaleStyle(key: ScaleProperty, value: number) {
  scaleStyles[key] = value
}

const VisibleDefault: Record<VisibleProperty, boolean> = {
	isAutoScale: true, // applied in OmsTrackMonitor.ce.vue
  vehicleNextLine: true, // applied in OmsTrackMonitor.ce.vue
  vehicleFromOrderLine: true, // applied in OmsTrackMonitor.ce.vue
  vehicleToOrderLine: true, // applied in OmsTrackMonitor.ce.vue
  vehicleMoveOrderLine: true, // applied in OmsTrackMonitor.ce.vue
  vehicleHomeivrLine: true, // applied in OmsTrackMonitor.ce.vue
  segmentDirection: true, // applied in OmsTrackMonitor.ce.vue
  pointLabel: true, // applied in OmsTrackMonitor.ce.vue
  pointHome: true, // applied in OmsTrackMonitor.ce.vue
  station: true, // applied in OmsTrackMonitor.ce.vue
  buffer: true, // applied in OmsTrackMonitor.ce.vue
  zcu: true, // applied in OmsTrackMonitor.ce.vue
  group: true, // applied in OmsTrackMonitor.ce.vue
  cluster: true, // applied in OmsTrackMonitor.ce.vue
  cps: true, // applied in OmsTrackMonitor.ce.vue
  fireshutter: true, // applied in OmsTrackMonitor.ce.vue
  mtl: true, // applied in OmsTrackMonitor.ce.vue
  backdrop: false, // applied in OmsTrackMonitor.ce.vue
  minimap: true, // applied in OmsTrackMonitor.ce.vue
}

const isAutoScale = ref<boolean>(VisibleDefault.isAutoScale)
const isAutoScaleInfo = readonly(isAutoScale)
function updateIsAutoScale(value: boolean) {
	isAutoScale.value = value
}
// All color configurations are applied in OmsTrackMonitor.ce.vue
const ColorDefault: Record<ColorProperty, string> = {
  background: 'white',
  station: 'black',
  stationDisabled: '#f06767',
  buffer: 'black',
  bufferDisabled: '#ff9494',
  bufferType: 'rgb(50,50,50)',
  point: 'black',
  home: '#00000060',
  normalSegment: 'grey',
  disabledSegment: 'purple',
  disabledByVehicleSegment: 'orange',
  disabledByMTLSegment: 'rgba(112,168,113,0.56)',

  // chjs visual start
  segmentDirection: 'grey',
  disconnectModeVehicleColor: '#E1D7C5',
  errorModeVehicleColor: '#FF3838',
  maintenanceModeVehicleColor: '#5C666D',
  manualModeVehicleColor: '#5C666D',
  idleModeVehicleColor: '#FCE83A',
  homeIvrModeVehicleColor: '#FFB302',
  runningModeVehicleColor: '#51E400',
  zcuBlockedVehicleColor: '#2DCCFF',
  // chjs visual end

  sensorStoppedVehicleColor: '#2DCCFF',
  cargoLoading: 'rgb(0, 0, 205)',
  cargoFull: 'rgb(50,50,50)',
  cargoUnloading: 'blue',
  fireshutterOpened: 'rgb(50, 145, 236)',
  fireshutterClosed: '#F04907',
  mtlUnuse: '#f98080',
  mtlUse: 'grey',

  //carrier
  carrierUnknownColor: '#000000',
  carrierEmptyColor: '#FF7F27',
  carrierFullColor: '#0000FF',
  carrierErrorColor: '#FF0000',
  passedTimeColor: '#FF0000',
  carrierInstalledColor: '#000000',


}

export {
  ScaleDefault,
  scaleStylesInfo,
  updateScaleStyle,
  VisibleDefault,
  ColorDefault,
	isAutoScaleInfo,
	updateIsAutoScale,
}
