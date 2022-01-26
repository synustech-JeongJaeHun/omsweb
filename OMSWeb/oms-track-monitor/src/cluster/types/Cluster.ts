import { PathCommand } from "../../utils/svg/pathSegment"
import { Color } from "../../types/Color"

type Cluster = {
  id: number
  color: keyof typeof Color
  logicalId: string
  maxVehicles: number
  segments: number[]
  pathCommands: PathCommand[]
}

export { Cluster }