import { ISegmentPart } from "../../legacies/models/track.model";
import { encodeCommandsToD } from "../../utils/svg/pathSegment";
import { makeD } from "../segments";
import { Segment } from "../types/Segment";

function makeSegmentsFromParts(parts: ISegmentPart[]): Segment[] {
  const map = new Map<number, ISegmentPart[]>()
  parts.forEach(segmentPart => {
    const parts = map.get(segmentPart.id) ?? []
    map.set(segmentPart.id, [...parts, segmentPart])
  })

  const array = Array<Segment>()
  map.forEach((parts, id) => {
    if (parts[0]) {
      const sample = parts[0]
      const sortedParts = parts.sort((a, b) => a.segpartId - b.segpartId)
      const pathCommands = makeD(
        sample.startPoint,
        sample.endPoint,
        // @ts-ignore
        sortedParts,
        sample.length
      )
      array.push({
        id: id,
        logicalId: sample.logicalId,
        physicalId: sample.physicalId,

        startPoint: sample.startPoint,
        endPoint: sample.endPoint,
        length: sample.length,
        speed: sample.speed,

        disabled: false,

        // @ts-ignore
        parts: sortedParts,
        pathCommands,
        d: encodeCommandsToD(pathCommands)
      })
    }
  })

  return array
}

export { makeSegmentsFromParts }