enum ObjectDirections {
  left = 'L',
  right = 'R',
  up = 'U',
  down = 'D',
}
enum SteerDirections {
  left = 'L',
  right = 'R',
  none = '',
}
enum NodeDirectionNames {
  None,
  Right,
  Left,
  Up,
  Down,
}

enum ViewModes {
  minimal = 'MINIMAL',
  editor = 'EDITOR',
  viewer = 'VIEWER',
  public = 'PUBLIC',
  playback = 'PLAYBACK',
}
enum MapTypes {
  MIN_MAX = 'MIN_MAX',
  MAIN = 'MAIN',
  MINIMAP = 'MINIMAP',
  FILE = 'FILE',
  DB = 'DB',
}

type ToggleOptionKeyType =
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

type CommandKeyType =
  | 'centerZoom'
  | 'search'
  | 'trackVehicle'
  | 'manualOrder'
  | 'getVehicleStatus'
  | 'setAutoVehicles'
  | 'resetVehicles'
  | 'eStopVehicles';

type MapConfigType = 'vehicleScale' | 'mapRotation' | 'segmentWidth' | 'segmentDirectionSize';

// enum MapToolbarStatusKeys {
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

enum AlertSeverities {
  normal = 0,
  warning,
  critical,
}

type OrderStatesType =
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

enum UserPermissions {
  none = 0,
  gnb = 1 << 0,
  controlActions = 1 << 1,
}

enum HostSessionStatusEnums {
  DISCONNECTED = 0,
  CONNECTED,
}

enum HostModeEnums {
  LOCAL = 0,
  HOST
}

enum TscModeEnums {
  DEFAULT = 0,
  INIT,
  PAUSED,
  AUTO,
  PAUSING
}

enum PmModeEnums {
  offline = 0,
  online,
}

enum PermissionEnums {
  HostMode = 1,
  TscMode = 2,
  AiMode = 3,
  ViewMonitorStatus = 4,
  ViewHistory = 5,
  ViewPlayback = 6,
  ViewReport = 7,
  ViewLog = 8,
  ViewControl = 9,
  ViewSettings = 10,

  ViewAlarm = 11,
  ViewWarning = 12,
  ManualTransfer = 13,
  DeleteOrder = 14,
  CancelOrder = 15,
  AbortOrder = 16,
  EstopVehicle = 17,
  ResetVehicle = 18,
  ResetAllVehicle = 19,
  AutoVehicle = 20,

  AutoAllVehicle = 21,
  HostOrderEnable = 22,
  PushEnable = 23,
  RailIn = 24,
  RailOut = 25,
  SetZcuGo = 26,
  SetZcuUsingType = 27,
  SetHomePoint = 28,
  ViewBuffer = 29,
  ViewVehicleStatus = 30,

  ViewItemDetails = 31,
  SegmentUnuse = 32,
  UserManagement = 33,
  SettingPreference = 34,
  SettingGroup = 35,
  SettingCluster = 36,
  SettingAlarmList = 37,
  SettingSegment = 38,
  SettingStation = 39,
  SettingBuffer = 40,

  SettingZcu = 41,
  SettingVehicle = 42
}

export { MapTypes, ToggleOptionKeyType, CommandKeyType, MapConfigType, ViewModes }