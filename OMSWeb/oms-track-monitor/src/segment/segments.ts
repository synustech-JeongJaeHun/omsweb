import { ref, watch } from "vue";
import { findPointById } from "../point/points";
import { segmentDisableds } from "./segmentDisableds";
import { Segment } from "./types/Segment";
import { SegmentPart } from "./types/SegmentPart";
import { makeDFromSegment } from "./utils/d";

const segments = ref<Segment[]>([])

watch(segmentDisableds, (disableds, prevDisableds) => {
  const enableds = prevDisableds.filter(pd => disableds.every(d => d.segmentId !== pd.segmentId))

  disableds.forEach((d) => {
    const segment = findSegmentById(d.segmentId)
    if (segment) segment.disabled = true
  })
  enableds.forEach((d) => {
    const segment = findSegmentById(d.segmentId)
    if (segment) segment.disabled = false
  })
})


function findSegmentById(id: number) {
  return segments.value.find(s => s.id === id)
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

// function useD(segment: Ref<Segment>) {
//   const startPointPosition = usePointPoisiton(computed(() => segment.value.startPoint))
//   const nextPointPosition = usePointPoisiton(computed(() => segment.value.endPoint))
//   const path = computed(() => makePathFromSegment(startPointPosition.value, nextPointPosition.value, segment.value.parts, segment.value.length))
//   return readonly(path)
// }

export { segments, findSegmentByPoints, makeD } 