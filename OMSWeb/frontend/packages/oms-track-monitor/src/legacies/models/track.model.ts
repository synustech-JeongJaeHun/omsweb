import { ICoordinate, IMapSize } from './drawing.model'

interface IBuffer {
  id: number
  logicalId: string
  physicalId: string
  direction: 'L' | 'R' | 'U'
  pointId: number
  nextPoint: number
  offset: number

  // nullable
  group?: number
  unuse?: boolean
  carrierId?: boolean
  user?: string
  note?: string
}
interface ICluster {
  id: number
  color: string
  logicalId: string
  maxVehicles: number
  segments: number[]
}

interface IClusterState {
  backup_id: string
  current_igbt: string
  current_r: string
  current_s: string
  current_t: string
  current_track: string
  error_code: string
  frequency: string
  id: number
  logicalId: string
  server_id: number
  status: string
  sync: string
  temp_internal: string
  temp_radiator: string
  total_kw: string
  voltage: string
  voltage_rs: string
  voltage_st: string
  voltage_tr: string
  wh: string
}
interface IGroup {
  id: number
  logicalId: string
  color: string
  objects: {
    id: number
    type: 'vehicle' | 'station' | 'buffer' | 'mtl' | 'home'
  }[]
}

interface IMTL {
  id: number
  logicalId: string
  physicalId: string
  pointId: number
  group?: number
  unuse?: boolean
  position?: any
  mode?: any
  errorList?: any
}
interface IZcu {
  id: number
  x: number
  y: number
  usingType: 0 | 1 | 2
  error: boolean
  zcuType: number
  inputZones: IZcuInputZone[]
  completePoints: IZcuCompletePoint[]
}
interface IZcuInputZone {
  id: number
  zcuId: number
  priorityPoint: number
  zonePoints: string
}
interface IZcuCompletePoint {
  id: number
  zcuId: number
  completePointId: number
}
interface IPoint extends ICoordinate {
  id: number
  logicalId: string
  physicalId: string
  group?: number
  isHome?: boolean
}
interface ISegPart {
  type?: string
  direction?: string
  location?: string
  x1?: number
  y1?: number
  x2?: number
  y2?: number
}
interface ISegmentPart extends ISegPart {
  id: number
  logicalId: string
  physicalId?: string

  startPoint: number
  endPoint: number
  length: number
  speed: number

  segpartId: number

  // nullable
  segparts?: ISegPart[]
  candidates?: any[]
  travelTime: any
  isValidate?: boolean
}
interface IStation {
  id: number
  logicalId: string
  physicalId: string

  direction: string
  pointId: number
  nextPoint: number
  offset: number

  unuse?: boolean

  group?: number
  carrierType?: string

  user?: string
  note?: string
}
interface IVehicle {
  id: number
  logicalId: string
  physicalId: string

  canBePushed: boolean
  cargoState:
    | 'L' // Loading
    | 'F' // Full
    | 'U' // Unload
    | 'E' // Empty
  curPoint: number
  nextPoint: number
  destPoint?: string
  errorList: string
  isBlocked: boolean
  isZcuBlocked: boolean
  isSensorStopped: boolean
  isMaint: boolean
  isConnected: boolean
  lastContact: string
  mapDb: string
  mode: 'A' | 'M'
  movingState: 'M' | 'S'
  distancePoint: number
  hostOrder: boolean
  orderOrigin: string | string[]

  // nullable
  cargoTransferResult?: string
  commandPoint?: any
  locationDropoff?: string
  locationMove?: string
  locationPickup?: string
  orderId?: number
  orderLogicalId?: string
  priority?: any
  type?: string
  group?: number
  historyChangeTime?: any
  user?: string
  note?: string
}

interface IFireshutter {
  id: number
  x: number
  y: number
  logicalId: string
  segments: string
  status: number
}

interface ITrackData {
  vehiclePath?: any[]

  width?: number
  height?: number
  minimumSegmentLength?: number

  buffers?: IBuffer[]
  clusters?: ICluster[]
  clusterStates?: IClusterState[]
  groups?: IGroup[]
  mtls?: IMTL[]
  points?: IPoint[]
  size?: IMapSize
  stations?: IStation[]
  zcus?: IZcu[]
  fireShutters?: IFireshutter[]
  segmentParts?: ISegmentPart[]
  segmentDisabled?: any[]
  vehicles?: IVehicle[]
}

export { ITrackData, IVehicle, ISegmentPart, IGroup }
