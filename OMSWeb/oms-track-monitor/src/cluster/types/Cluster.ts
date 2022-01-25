import { PathCommand } from "../../utils/svg/pathSegment"
import { ClusterColor } from "./ClusterColor"

type Cluster = {
  id: number
  color: keyof typeof ClusterColor
  logicalId: string
  maxVehicles: number
  segments: number[]
  pathCommands: PathCommand[]
}

export { Cluster }