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
}

export { Vehicle }