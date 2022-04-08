import { CanBeFocused } from "src/MapObjects/focus/types/CanBeFocused"

type Station = {
  id: number
  logicalId: string
  physicalId: string

  direction: string
  pointId: number
  nextPoint: number
  offset: number

  group?: number
  carrierType?: string
} & CanBeFocused

export { Station }