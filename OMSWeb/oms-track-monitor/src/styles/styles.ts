import { reactive, readonly } from 'vue';
import { deepCopy } from '../utils/deepCopy';
import { ColorProperty } from './types/ColorProperty';
import { ScaleProperty } from './types/ScaleProperty';
import { VisibleProperty } from './types/VisibleProperty';

const ScaleDefault: Record<ScaleProperty, number> = {
  vehicleSize: 10,
  segmentDirection: 6,
  segmentWidth: 3,
}
const scaleStyles = reactive(deepCopy(ScaleDefault))
const scaleStylesInfo = readonly(scaleStyles)

function updateScaleStyle(key: ScaleProperty, value: number) {
  scaleStyles[key] = value
}

const VisibleDefault: Record<VisibleProperty, boolean> = {
  vehicleLine: true,
  segmentDirection: true,
  pointLabel: true,
  station: true,
  buffer: true,
  group: true,
  cluster: true,
  overlappingObjects: true,
  minimap: true,
}
const visibleStyles = reactive(deepCopy(VisibleDefault))
const visibleStylesInfo = readonly(visibleStyles)

function updateVisibleStyle(key: VisibleProperty, value: boolean) {
  visibleStyles[key] = value
}

const ColorDefault: Record<ColorProperty, string> = {
  background: "white",
  station: "black",
  buffer: "black",
  point: "black",
  vehicleExpectedPath: "green", // something weird
  normalSegment: "grey",
  disabledSegment: "purple",
  segmentDirection: "grey",
  autoModeVehicle: "grey",
  manualModeVehicle: "green",
  noneModeVehicle: "transparent",
  cargoLoading: "rgb(0, 0, 205)",
  cargoFull: "rgb(50,50,50)",
  cargoUnloading: "blue"
}

export {
  ScaleDefault,
  ColorDefault,

  scaleStylesInfo,
  visibleStylesInfo,

  updateScaleStyle,
  updateVisibleStyle,
}