import {Color} from "src/types/Color";

namespace UpdateDto {
  export type Operation = 'INSERT' | 'UPDATE' | 'DELETE'
  export type Vehicle = {
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

    railIn?: boolean
  }

  export type Segment = {}

  export type SegmentDisabled = {
    operation: Operation
    id: number
  } & (
    | {
        operation: 'INSERT'
        data: {
          id: number
          segmentId: number
          disabledBy: string
          disabledReason: string
          user?: string
          note?: string
        }
      }
    | { operation: 'DELETE' }
  )
  export type Zcu = {
    id: number

    x?: number
    y?: number
    usingType?: number
    error?: boolean
    zcuType?: number
  }

  export type Station = {
    id: number
    unuse?: boolean
    user?: string
    note?: string

    carrierId?: string
  }
  export type Buffer = {
    id: number
    unuse?: boolean
    carrierId?: string
    user?: string
    note?: string
    type?: string
  }

  export type GroupObject = {
    id: number
    groupId: number
    referenceId: number
    referenceTable: 'vehicle' | 'station' | 'buffer' | 'mtl' | 'home'
  }

  export type Home = {
    id: number
    point: number
  }
  export type Fireshutter = {
    id: number
    x: number
    y: number
    logicalId: string
    segments: string
    status: number
    fireDetect: number
    open:number
  }

  export type Mtl = {
    id: number
    logicalId: string
    physicalId: string
    pointId: number

    unuse?: boolean
  }

  export type ClusterState = {
    id: number // this is cluster_status.server_id
    converterId: number
    status: number
    backupId: number
  }

  export type Clusters = {
    id: number
    color: keyof typeof Color
    logicalId: string
    maxVehicles: number
  }

  export type Backdrop = {
    id: number
    logicalId: string
    x?: number
    y?: number
    width?: number
    height?: number
    color: string
    outlineThickness?: number
    outlineType?: number
    contents: string
    direction?: number
    vAlign?: number
    hAlign?: number
    bold: number
    italic: boolean
    fontSize: number
  }
}

export { UpdateDto }
