import { CommandKeyType, MapConfigType, ToggleOptionKeyType } from './enums';
import { ControlTable } from './settings.model';

export interface ISize {
  width?: number;
  height?: number;

  rotatedWidth?: number;
  rotatedHeight?: number;
}
export interface ICoordinate {
  x?: number;
  y?: number;
}
export interface IMapSize extends ISize {
  maxX?: number;
  maxY?: number;

  minX?: number;
  minY?: number;

  min?: any;
  max?: any;
}
export interface IMapGeometry {
  screenSize?: ISize;
  minimapSize?: ISize;
  trackSize?: IMapSize;
  fabSize?: IMapSize;
  initialFabSize?: IMapSize;
  invertFactorY?: number;
}
export interface IZoom {
  x?: number;
  y?: number;
  k?: number;
  min?: number;
  max?: number;
}
export interface IZoomInfos {
  min?: number;
  max?: number;
  main?: IZoom;
  minimap?: IZoom;

  x?: number;
  y?: number;
  k?: number;

  invertY?: number;
  invertX?: number;
}

export interface IMapToolbarToggleEvent {
  type: ToggleOptionKeyType;
  value: boolean;
}
export interface IMapToolbarCommandEvent {
  type: CommandKeyType;
  value?: any;
}

export interface IMapConfigChangeEvent {
  type: MapConfigType;
  value?: any;
}

export interface IMapNodeScale {
  scale: number;
  value: number;
}

export interface IControlTableEvent {
  type: string;
  value: boolean;
}
