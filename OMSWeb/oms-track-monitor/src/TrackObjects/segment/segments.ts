import { computed, ref } from "vue";
import { findPointById } from "../point/points";
import { Point } from "../point/types/Point";
import { Segment } from "./types/Segment";
import { SegmentPart } from "./types/SegmentPart";
import { makeDFromSegment } from "./utils/d";

const segments = ref<Segment[]>([])
/**
 * segments aren't updated, so we can use computed with shallow reference changed.
 * when segments become realtime-update object, then refactoring this map.
 */
const segmentMap = computed(() => new Map(segments.value.map(s => [s.id, s])))
const segmentMapByStartPointId = computed(() => {
  const map = new Map<Point['id'], Segment[]>()

  segments.value.forEach(segment => {
    const key = segment.startPoint
    const value = map.get(key) ?? []
    map.set(key, [...value, segment])
  });

  return map
})

function findSegmentById(id: number) { return segmentMap.value.get(id) }

function setSegmentDisabled(id: Segment['id'], disabled: boolean) {
  const segment = findSegmentById(id)
  if (segment) segment.disabled = disabled
}

function findSegmentByPoints(startPointId: number, endPointId: number) {
  return segmentMapByStartPointId.value.get(startPointId)?.find(s => s.endPoint === endPointId)
}

function makeD(startPointId: number, endPointId: number, parts: SegmentPart[], length: number) {
  const startPoint = findPointById(startPointId) ?? { x: 0, y: 0 }
  const endPoint = findPointById(endPointId) ?? { x: 0, y: 0 }

  return makeDFromSegment(startPoint, endPoint, parts, length)
}

export { segments, findSegmentById, findSegmentByPoints, setSegmentDisabled, makeD } 