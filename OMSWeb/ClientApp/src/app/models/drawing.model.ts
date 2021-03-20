import { CommandKeyType, ToggleOptionKeyType } from './enums';

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

export interface IMapToolbarToggleEvent {
  type: ToggleOptionKeyType;
  value: boolean;
}
export interface IMapToolbarCommandEvent {
  type: CommandKeyType;
  value?: any;
}
