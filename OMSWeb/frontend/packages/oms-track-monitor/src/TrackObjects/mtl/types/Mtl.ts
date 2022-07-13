import { CanBeFocused } from 'src/MapObjects/focus/types/CanBeFocused'

type Mtl = {
  id: number
  logicalId: string
  physicalId: string
  pointId: number

  // nullable
  unuse?: boolean
  group?: number
  position?: any
  mode?: any
  errorList?: any
} & CanBeFocused

export { Mtl }
