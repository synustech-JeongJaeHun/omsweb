type Buffer = {
  id: number
  logicalId: string
  physicalId: string
  direction: string
  pointId: number
  nextPoint: number
  offset: number

  // nullable
  group?: number
}

export { Buffer } 