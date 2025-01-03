import { CanBeCarrierFocused, CarrierInstalled } from 'src/MapObjects/focus/types/CanBeCarrierFocused'
import { CanBeFocused } from 'src/MapObjects/focus/types/CanBeFocused'

type Buffer = {
  id: number
  logicalId: string
  physicalId: string

  direction: 'L' | 'R' | 'U'
  pointId: number
  nextPoint: number
  offset: number

  unuse?: boolean
  state?: number
  carrierId?: boolean

  // nullable
  group?: number

  user?: string
  note?: string

  cAlias?: string
  type?: string
} & CanBeFocused &
  CanBeCarrierFocused
  & CarrierInstalled


type Carrier = {} & CarrierInstalled
export { Buffer, Carrier }
