import { CanBeFocused } from "src/MapObjects/focus/types/CanBeFocused"

type Point = {
  id: number
  logicalId: string
  physicalId: string
  x: number
  y: number

  // nullable
  group?: number
  isHome?: boolean
} & CanBeFocused

export { Point }