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
  ToggleOptionKeyType,
  CommandKeyType,
  MapConfigType,
}
