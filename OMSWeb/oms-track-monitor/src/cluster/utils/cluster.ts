import { Segment } from "../../segment/types/Segment";
import { Cluster } from "../types/Cluster";
import { Color } from "../../types/Color";

type ClusterWithOutPathCommands = {
  id: number
  color: string
  logicalId: string
  maxVehicles: number
  segments: number[]
}
function makeClustersFromSegments(clusters: ClusterWithOutPathCommands[], segments: Segment[]): Cluster[] {
  return clusters.map(cluster =>
  ({
    ...cluster,
    color: cluster.color as keyof typeof Color,
    pathCommands: cluster.segments.flatMap((id) => segments.find(s => s.id === id)?.pathCommands ?? []),
  }))
}

export { makeClustersFromSegments }