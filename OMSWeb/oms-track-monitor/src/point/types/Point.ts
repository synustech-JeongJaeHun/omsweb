type Point = {
  id: number
  logicalId: string
  physicalId: string
  x: number
  y: number

  // nullable
  group?: number
  isHome?: boolean
}

export { Point }