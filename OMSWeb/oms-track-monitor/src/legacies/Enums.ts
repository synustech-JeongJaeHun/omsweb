type ViewModes = 'MINIMAL' | 'EDITOR' | 'VIEWER' | 'PUBLIC' | 'PLAYBACK'

type MapTypes = 'MIN_MAX' | 'MAIN' | 'MINIMAP' | 'FILE' | 'DB'

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
  | 'overlaps'

type CommandKeyType =
  | 'centerZoom'
  | 'search'
  | 'trackVehicle'
  | 'manualOrder'
  | 'getVehicleStatus'
  | 'setAutoVehicles'
  | 'resetVehicles'
  | 'eStopVehicles'

type MapConfigType =
  | 'vehicleScale'
  | 'mapRotation'
  | 'segmentWidth'
  | 'segmentDirectionSize'

export {
  MapTypes,
  ToggleOptionKeyType,
  CommandKeyType,
  MapConfigType,
  ViewModes,
}
