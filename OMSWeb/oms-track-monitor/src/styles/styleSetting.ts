import { reactive, readonly } from 'vue';
import { ColorProperty } from './types/ColorProperty';
import { ScaleProperty } from './types/ScaleProperty';
import { VisibleProperty } from './types/VisibleProperty';

const ScaleDefault: Record<ScaleProperty, string> = {
  vehicleSize: "10px",
  segmentDirection: "10px",
  segmentWidth: "10px",
  mapRotation: "10px",
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

const styleSetting = reactive({
  scale: ScaleDefault,
  visible: VisibleDefault,
  color: ColorDefault,
})

const styleSettingInfo = readonly(styleSetting)

function setScale(key: ScaleProperty, value: number) {
  styleSetting.scale[key] = `${value}px`
}

function setVisible(key: VisibleProperty, value: boolean) {
  styleSetting.visible[key] = value
}

function setColor(key: ColorProperty, value: string) {
  styleSetting.color[key] = value
}
export {
  ScaleProperty,
  VisibleProperty,
  ColorProperty,

  styleSettingInfo,

  setScale,
  setVisible,
  setColor,
}