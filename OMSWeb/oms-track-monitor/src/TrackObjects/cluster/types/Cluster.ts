import { Color } from "src/types/Color"
import { D } from "src/types/D"
import { PathCommand } from "src/utils/svg/pathSegment"

type Cluster = {
  id: number
  color: keyof typeof Color
  logicalId: string
  maxVehicles: number
  segments: number[]
  pathCommands: PathCommand[]
  d: D
}

export { Cluster }