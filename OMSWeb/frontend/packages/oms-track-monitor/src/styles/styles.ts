import { reactive, readonly } from 'vue'
import { deepCopy } from '../utils/deepCopy'
import { ColorProperty } from './types/ColorProperty'
import { ScaleProperty } from './types/ScaleProperty'
import { VisibleProperty } from './types/VisibleProperty'

const ScaleDefault: Record<ScaleProperty, number> = {
  vehicleSize: 10, // applied in OmsTrackMonitor.ce.vue
  vehicleTextSize: 12,
  zcuSize: 7, // applied in OmsTrackMonitor.ce.vue
  segmentDirection: 6, // applied in SegmentLayer.ce.vue
  segmentWidth: 3, // applied in OmsTrackMonitor.ce.vue
  stationMargin: 300, // applied in OmsTrackMonitor.ce.vue
  bufferMargin: 300, // applied in OmsTrackMonitor.ce.vue
}
const scaleStyles = reactive(deepCopy(ScaleDefault))
const scaleStylesInfo = readonly(scaleStyles)

function updateScaleStyle(key: ScaleProperty, value: number) {
  scaleStyles[key] = value
}

const VisibleDefault: Record<VisibleProperty, boolean> = {
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
  minimap: true, // applied in OmsTrackMonitor.ce.vue
}

// All color configurations are applied in OmsTrackMonitor.ce.vue
const ColorDefault: Record<ColorProperty, string> = {
  background: 'white',
  station: 'black',
  stationDisabled: '#f06767',
  buffer: 'black',
  bufferDisabled: '#ff9494',
  point: 'black',
  home: '#00000060',
  normalSegment: 'grey',
  disabledSegment: 'purple',
  disabledByVehicleSegment: 'orange',
  disabledByMTLSegment: 'rgba(112,168,113,0.56)',
  segmentDirection: 'grey',

  // chjs visual start
  disconnectModeVehicleColor: '#E1D7C5',
  errorModeVehicleColor: '#FF3838',
  maintenanceModeVehicleColor: '#5C666D',
  manualModeVehicleColor: '#5C666D',
  idleModeVehicleColor: '#FCE83A',
  homeIvrModeVehicleColor: '#FFB302',
  runningModeVehicleColor: '#51E400',
  zcuBlockedVehicleColor: '#2DCCFF',
  sensorStoppedVehicleColor: '#2DCCFF',
  // chjs visual end

  cargoLoading: 'rgb(0, 0, 205)',
  cargoFull: 'rgb(50,50,50)',
  cargoUnloading: 'blue',
  fireshutterOpened: 'rgb(50, 145, 236)',
  fireshutterClosed: '#F04907',
  mtlUnuse: '#f98080',
  mtlUse: 'grey',
}

export {
  ScaleDefault,
  scaleStylesInfo,
  updateScaleStyle,
  VisibleDefault,
  ColorDefault,
}
