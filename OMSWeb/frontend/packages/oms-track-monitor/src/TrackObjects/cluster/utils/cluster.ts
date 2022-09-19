import { Segment } from '../../segment/types/Segment'
import { Cluster } from '../types/Cluster'
import { Color } from 'src/types/Color'
import { encodeCommandsToD } from 'src/utils/svg/pathSegment'
import { findPointById } from 'src/TrackObjects/point/points'

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
    const clusterSegments = cluster.segments.map((sid) =>
      segments.find((s) => s.id === sid)
    )

    const points = Array.from(
      new Set(
        clusterSegments.flatMap((cs) =>
          cs ? [cs.startPoint, cs.endPoint] : []
        )
      )
    ).map((id) => findPointById(id))

    const centerPosition = (() => {
      if(points.length === 0) return undefined

      const minX = Math.min(...points.map(p => p!.x))
      const minY = Math.min(...points.map(p => p!.y))
      const maxX = Math.max(...points.map(p => p!.x))
      const maxY = Math.max(...points.map(p => p!.y))

      return {x: (minX + maxX) / 2, y: (minY + maxY) / 2}
    })()

    const pathCommands = clusterSegments.flatMap(
      (s) => s?.pathCommands ?? []
    )

    return {
      ...cluster,
      color: cluster.color as keyof typeof Color,
      d: encodeCommandsToD(pathCommands),
      centerPosition,
    }
  })
}

export { makeClustersFromSegments }
