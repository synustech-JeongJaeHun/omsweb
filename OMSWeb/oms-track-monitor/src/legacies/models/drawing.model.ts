import {
  CommandKeyType,
  MapConfigType,
  ToggleOptionKeyType,
} from '../Enums'

interface ISize {
  width?: number
  height?: number

  rotatedWidth?: number
  rotatedHeight?: number
}
interface ICoordinate {
  x?: number
  y?: number
}
interface IMapSize extends ISize {
  maxX?: number
  maxY?: number

  minX?: number
  minY?: number

  min?: any
  max?: any
}
interface IZoom {
  x?: number
  y?: number
  k?: number
  min?: number
  max?: number
}

interface IMapToolbarToggleEvent {
  type: ToggleOptionKeyType
  value: boolean
}
interface IMapToolbarCommandEvent {
  type: CommandKeyType
  value?: any
}

interface IMapConfigChangeEvent {
  type: MapConfigType
  value?: any
}

export {
  ICoordinate,
  IMapSize,
  IZoom,
  IMapToolbarToggleEvent,
  IMapToolbarCommandEvent,
  IMapConfigChangeEvent,
}
