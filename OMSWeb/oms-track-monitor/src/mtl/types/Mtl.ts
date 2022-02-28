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

  // for tm
  isFocused?: boolean
}

export { Mtl }