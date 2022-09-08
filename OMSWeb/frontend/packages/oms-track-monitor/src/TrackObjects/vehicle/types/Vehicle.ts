import { CanBeFocused } from 'src/MapObjects/focus/types/CanBeFocused'
import { CanBeTracked } from 'src/MapObjects/track/types/CanBeTracked'
import { IsHovered } from './IsHovered'

type UpdateType =
  | 'NoAnimation'
  | 'AnimationIn1Segment'
  | 'AnimationIn2Segments'

type ComplicatedMode =
  | 'DISCONNECT'
  | 'ERROR'
  | 'MAINTENANCE'
  | 'MANUAL'
  | 'SENSORSTOPPED'
  | 'ZCUBLOCKED'
  | 'HOMEIVR'
  | 'RUNNING'
  | 'IDLE'

type Vehicle = {
  id: number
  logicalId: string
  physicalId: string

  canBePushed: boolean // data for prevent push
  cargoState:
    | 'L' // Loading
    | 'F' // Full
    | 'U' // Unload
    | 'E' // Empty
  curPoint: number
  nextPoint: number
  errorList: string
  isBlocked: boolean
  isZcuBlocked: boolean
  isSensorStopped: boolean
  isMaint: boolean
  isConnected: boolean
  lastContact: string
  mapDb: string
  mode?:
    | 'A' // Auto
    | 'M' // Manual
  movingState: 'M' | 'S'
  distancePoint: number
  hostOrder: boolean
  orderOrigin: string | string[] // data for prevent call

  // update
  lastUpdated?: number // always assigned with Date.now()
  updateType?: UpdateType

  // nullable
  cargoTransferResult?: string // if it is not nullish, then it means unload/load fail
  carrierId?: string
  commandPoint?: string
  locationDropoff?: string
  /**
   * - if station `s12` s and id
   * - if buffer `b91` b and id
   * - if point `p594` p and id
   */
  locationMove?: string
  locationPickup?: string
  orderId?: number
  orderLogicalId?: string
  priority?: any
  type?: // normal: nullish
  | 'CLEANING' // Vehicle type: Cleaning
  | string
  group?: number
  historyChangeTime?: any
} & CanBeFocused &
  CanBeTracked &
  IsHovered

export { Vehicle, UpdateType, ComplicatedMode }
