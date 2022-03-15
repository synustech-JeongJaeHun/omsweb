# Types

## Attribute Types

```ts
type ViewMode = 'MINIMAL' | 'EDITOR' | 'VIEWER' | 'PUBLIC' | 'PLAYBACK'

type MapType = 'MIN_MAX' | 'MAIN' | 'MINIMAP' | 'FILE' | 'DB'

type Boolish = boolean | string | undefined | null
type Numberlish = number | string | undefined | null
type Stringlish = string | undefined | null
```

## Event Types

```typescript
type MainClickOnObject =
  | { type: 'POINT'; value: Point }
  | { type: 'SEGMENT'; value: Segment }
  | { type: 'STATION'; value: Station }
  | { type: 'BUFFER'; value: Buffer }
  | { type: 'MTL'; value: Mtl }
  | { type: 'ZCU'; value: Zcu }
  | { type: 'VEHICLE'; value: Vehicle }

type SecondaryClickOnObject =
  | { type: 'POINT'; value: Point; event: MouseEvent }
  | { type: 'SEGMENT'; value: Segment; event: MouseEvent }
  | { type: 'STATION'; value: Station; event: MouseEvent }
  | { type: 'BUFFER'; value: Buffer; event: MouseEvent }
  | { type: 'MTL'; value: Mtl; event: MouseEvent }
  | { type: 'ZCU'; value: Zcu; event: MouseEvent }
  | { type: 'VEHICLE'; value: Vehicle; event: MouseEvent }

type ClickOutObject = void

type MouseoverOnObject =
  | { type: 'POINT'; value: Point; event: MouseEvent }
  | { type: 'SEGMENT'; value: Segment; event: MouseEvent }
  | { type: 'CLUSTER'; value: Cluster; event: MouseEvent }
  | { type: 'STATION'; value: Station; event: MouseEvent }
  | { type: 'BUFFER'; value: Buffer; event: MouseEvent }
  | { type: 'MTL'; value: Mtl; event: MouseEvent }
  | { type: 'ZCU'; value: Zcu; event: MouseEvent }
  | { type: 'VEHICLE'; value: Vehicle; event: MouseEvent }

type MouseleaveOnObject = void
```

### Method Types

```typescript
interface ITrackData {
  buffers?: IBuffer[]
  clusters?: ICluster[]
  groups?: IGroup[]
  mtls?: IMTL[]
  points?: IPoint[]
  stations?: IStation[]
  zcus?: IZcu[]
  segmentParts?: ISegmentPart[]
  segmentDisabled?: any[]
  vehicles?: IVehicle[]
}

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
    errorList: string
    isBlocked: boolean
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
}
```
