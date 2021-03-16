import { MapToolbarCommandKeys, MapToolbarStatusKeys } from './enums';

export interface ISize {
  width?: number;
  height?: number;

  rotated_width?: number;
  rotated_height?: number;
}
export interface ICoordinate {
  x?: number;
  y?: number;
}
export interface IMapSize extends ISize {
  max_x?: number;
  max_y?: number;

  min_x?: number;
  min_y?: number;

  min?: any;
  max?: any;
}
export interface IMapGeometry {
  screen_size?: ISize;
  minimap_size?: ISize;
  track_size?: IMapSize;
  fab_size?: IMapSize;
  initial_fab_size?: IMapSize;
  invert_factor_y?: number;
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

export type MapVisibilityOptionsType = {
  [key in MapToolbarStatusKeys]: boolean;
};
export const defaultMapVisibilityOptions: MapVisibilityOptionsType = {
  minimap: true,
  controlTable: false,
  expectedPaths: false,
  vehicleLines: false,
  pointLabels: false,
  segmentDirections: true,
  stations: true,
  buffers: false,
  groups: true,
  mtls: true,
  vehicles: true,
  clusters: true,
  overlaps: false,
};
export interface IMapPreferences {
  visibilities: MapVisibilityOptionsType;
}

export interface IMapToolbarToggleEvent {
  type: MapToolbarStatusKeys;
  value: boolean;
}
export interface IMapToolbarCommandEvent {
  type: MapToolbarCommandKeys;
  value?: any;
}
