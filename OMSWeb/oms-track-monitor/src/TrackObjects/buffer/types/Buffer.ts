type Buffer = {
  id: number
  logicalId: string
  physicalId: string

  direction: "L" | "R" | "U"
  pointId: number
  nextPoint: number
  offset: number

  // nullable
  group?: number

  // for tm
  isFocused?: boolean
}

export { Buffer } 