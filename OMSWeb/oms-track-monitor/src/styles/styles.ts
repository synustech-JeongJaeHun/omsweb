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

function updateVisibleStyle(key: VisibleProperty, value: boolean) {
  visibleStyles[key] = value
}

const ColorDefault: Record<ColorProperty, string> = {
  homeBackground: "white",
  playbackBackground: "white",
  station: "black",
  buffer: "black",
  point: "black",
  vehicleExpectedPath: "green",
  normalSegment: "gray",
  disabledSegment: "purple",
  segmentDirection: "gray",
  autoModeVehicle: "gray",
  manualModeVehicle: "green",
  noneModeVehicle: "transparent",
  cargoLoading: "blue",
  cargoFull: "blue",
  cargoUnloading: "blue"
}
const colorStyles = reactive(deepCopy(ColorDefault))

function updateColorStyle(key: ColorProperty, value: string) {
  colorStyles[key] = value
}

export {
  scaleStylesInfo,

  updateScaleStyle,
  updateVisibleStyle,
  updateColorStyle,
}