import { Color } from 'src/types/Color'
import { D } from 'src/types/D'

type Cluster = {
  id: number
  color: keyof typeof Color
  logicalId: string
  maxVehicles: number
  segments: number[]
  d: D
}

export { Cluster }
