import { CanBeFocused } from 'src/MapObjects/focus/types/CanBeFocused'
import { Color } from 'src/types/Color'
import { D } from 'src/types/D'
import { Position } from 'src/types/Position'

type Cluster = {
  id: number
  color: keyof typeof Color
  logicalId: string
  maxVehicles: number
  segments: number[]
  d: D
  centerPosition?: Position
} & CanBeFocused

export { Cluster }
