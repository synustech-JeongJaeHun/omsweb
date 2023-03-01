import { CanBeCarrierFocused } from 'src/MapObjects/focus/types/CanBeCarrierFocused'
import { CanBeFocused } from 'src/MapObjects/focus/types/CanBeFocused'

type Station = {
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

  cAlias?: string
} & CanBeFocused &
  CanBeCarrierFocused

export { Station }
