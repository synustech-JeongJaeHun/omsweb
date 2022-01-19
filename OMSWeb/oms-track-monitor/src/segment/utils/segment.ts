import { ISegmentPart } from "../../legacies/models/track.model";
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
        // @ts-ignore
        d: makeD(sample.startPoint, sample.endPoint, sortedParts, sample.length)
      })
    }
  })

  return array
}

function getSegmentPathId(id: number) {
  return `segment-path-${id}`
}

export { makeSegmentsFromParts, getSegmentPathId }