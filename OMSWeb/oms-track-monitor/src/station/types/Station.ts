type Station = {
  id: number
  logicalId: string
  physicalId: string

  direction: string
  pointId: number
  nextpoint: number
  offset: number

  group?: number
  carrierType?: string
}

export { Station }