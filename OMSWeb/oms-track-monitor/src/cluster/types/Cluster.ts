import { PathCommand } from "../../utils/svg/pathSegment"
import { Color } from "../../types/Color"
import { D } from "../../types/D"

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