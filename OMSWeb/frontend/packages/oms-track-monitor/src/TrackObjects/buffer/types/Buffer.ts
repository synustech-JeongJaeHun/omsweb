import { CanBeCarrierFocused } from 'src/MapObjects/focus/types/CanBeCarrierFocused'
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
  carrierId?: boolean

  // nullable
  group?: number

  user?: string
  note?: string

  cAlias?: string
} & CanBeFocused &
  CanBeCarrierFocused

export { Buffer }
