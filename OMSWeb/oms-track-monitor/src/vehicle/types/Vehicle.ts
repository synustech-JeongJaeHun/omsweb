type UpdateType =
  | "NoAnimation"
  | "AnimationIn1Segment"
  | "AnimationIn2Segments"

type Vehicle = {
  id: number
  logicalId: string
  physicalId: string

  canBePushed: boolean
  cargoState: string
  curPoint: number
  nextPoint: number
  errorList: string
  isBlocked: boolean
  isSensorStopped: boolean
  lastContact: string
  mapDb: string
  mode: string
  movingState: string
  distancePoint: number
  hostOrder: boolean
  orderOrigin: string | string[]

  // update
  lastUpdated?: number, // always assigned with Date.now()
  updateType?: UpdateType

  // nullable
  cargoTransferResult?: string
  commandPoint?: string
  locationDropoff?: string
  locationMove?: string
  locationPickup?: string
  orderId?: number
  orderLogicalId?: string
  priority?: any
  type?: string
  group?: number
  historyChangeTime?: any
}

export { Vehicle, UpdateType }