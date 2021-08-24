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
  | 'zcus'
  | 'vehicles'
  | 'clusters'
  | 'showToolName'
  | 'showOmsVersion'
  | 'showKpi'
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

export type MapConfigType = 'vehicleScale' | 'mapRotation' | 'segmentWidth' | 'segmentDirectionSize';

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
  DISCONNECTED = 0,
  CONNECTED,
}

export enum HostModeEnums {
  LOCAL = 0,
  HOST
}

export enum TscModeEnums {
  INIT = 1,
  PAUSED,
  AUTO,
  PAUSING
}

export enum PmModeEnums {
  offline = 0,
  online,
}
