import { Segment } from '../../segment/types/Segment'
import { Cluster } from '../types/Cluster'
import { Color } from 'src/types/Color'
import { encodeCommandsToD } from 'src/utils/svg/pathSegment'

type ClusterWithOutPathCommands = {
  id: number
  color: string
  logicalId: string
  maxVehicles: number
  segments: number[]
}
function makeClustersFromSegments(
  clusters: ClusterWithOutPathCommands[],
  segments: Segment[]
): Cluster[] {
  return clusters.map((cluster) => {
    const pathCommands = cluster.segments.flatMap(
      (id) => segments.find((s) => s.id === id)?.pathCommands ?? []
    )

    return {
      ...cluster,
      color: cluster.color as keyof typeof Color,
      d: encodeCommandsToD(pathCommands),
    }
  })
}

export { makeClustersFromSegments }
