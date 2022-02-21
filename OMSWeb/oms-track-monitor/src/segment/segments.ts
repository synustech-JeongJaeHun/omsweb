import { ref } from "vue";
import { findPointById } from "../point/points";
import { Segment } from "./types/Segment";
import { SegmentPart } from "./types/SegmentPart";
import { makeDFromSegment } from "./utils/d";

const segments = ref<Segment[]>([])

function findSegmentById(id: number) {
  return segments.value.find(s => s.id === id)
}

function setSegmentDisabled(id: Segment['id'], disabled: boolean) {
  const segment = findSegmentById(id)
  if (segment) segment.disabled = disabled
}

function findSegmentByPoints(pointId1: number, pointId2: number) {
  return segments.value.find(s =>
    (s.startPoint === pointId1 && s.endPoint === pointId2)
    || (s.startPoint === pointId2 && s.endPoint === pointId1)
  )
}

function makeD(startPointId: number, endPointId: number, parts: SegmentPart[], length: number) {
  const startPoint = findPointById(startPointId) ?? { x: 0, y: 0 }
  const endPoint = findPointById(endPointId) ?? { x: 0, y: 0 }

  return makeDFromSegment(startPoint, endPoint, parts, length)
}

export { segments, findSegmentByPoints, setSegmentDisabled, makeD } 