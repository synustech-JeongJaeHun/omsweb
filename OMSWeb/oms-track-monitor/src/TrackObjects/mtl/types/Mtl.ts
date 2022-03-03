import { CanBeFocused } from "src/MapObjects/focus/types/CanBeFocused"

type Mtl = {
  id: number
  logicalId: string
  physicalId: string
  pointId: number

  // nullable
  group?: number
  inUse?: boolean
  position?: any
  mode?: any
  errorList?: any
} & CanBeFocused

export { Mtl }