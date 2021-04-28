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
export enum NodeDirectionNames {
  None,
  Right,
  Left,
  Up,
  Down,
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

export type ToggleOptionKeyType =
  | 'itemDetails'
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

export type CommandKeyType =
  | 'centerZoom'
  | 'search'
  | 'trackVehicle'
  | 'manualOrder'
  | 'getVehicleStatus'
  | 'setAutoVehicles'
  | 'resetVehicles'
  | 'eStopVehicles';

export type MapConfigType = 'vehicleScale' | 'mapRotation' | 'segmentWidth';

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

export enum AlertSeverities {
  normal = 0,
  warning,
  critical,
}

export type OrderStatesType =
  | 'FAILED'
  | 'ABORTED'
  | 'COMPLETED'
  | 'UNLOADED'
  | 'UNLOADING'
  | 'LOADED'
  | 'LOADING'
  | 'ARRIVED'
  | 'ASSIGNED'
  | 'UNASSIGNED';

export enum UserPermissions {
  none = 0,
  gnb = 1 << 0,
  controlActions = 1 << 1,
}

export enum HostSessionStatusEnums {
  offline = 0,
  online,
}

export enum HostModeEnums {
  offline = 0,
  pm,
  onlineRemote,
  onlineLocal,
}

export enum TscModeEnums {
  auto = 0,
  pausing,
  paused,
}
