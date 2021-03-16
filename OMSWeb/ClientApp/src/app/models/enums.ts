export enum ObjectDirections {
  left = 'L',
  right = 'R',
  up = 'U',
  down = 'D',
}
export enum SteerDirections {
  left = 'L',
  right = 'R',
  none = '',
}

export enum ViewModes {
  minimal = 'MINIMAL',
  editor = 'EDITOR',
  viewer = 'VIEWER',
  public = 'PUBLIC',
  playback = 'PLAYBACK',
}
export enum MapTypes {
  MIN_MAX = 'MIN_MAX',
  MAIN = 'MAIN',
  MINIMAP = 'MINIMAP',
  FILE = 'FILE',
  DB = 'DB',
}

export type MapToolbarStatusKeys =
  | 'minimap'
  | 'controlTable'
  | 'vehicleLines'
  | 'expectedPaths'
  | 'vehicleLines'
  | 'pointLabels'
  | 'segmentDirections'
  | 'stations'
  | 'buffers'
  | 'groups'
  | 'mtls'
  | 'vehicles'
  | 'clusters'
  | 'overlaps';

// export enum MapToolbarStatusKeys {
//   minimap,
//   controlTable,

//   vehicleLines,
//   expectedPaths,
//   pointLabels,
//   segmentDirections,
//   stations,
//   buffers,
//   groups,
//   clusters,
//   overlaps,
// }
