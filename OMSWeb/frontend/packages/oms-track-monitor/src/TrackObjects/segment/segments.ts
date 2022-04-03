import { ITrackData } from 'src/legacies/models/track.model'
import { ref } from 'vue'
import { findPointById } from '../point/points'
import { Point } from '../point/types/Point'
import { Segment } from './types/Segment'
import { SegmentPart } from './types/SegmentPart'
import { makeDFromSegment } from './utils/d'
import { makeSegmentsFromParts } from './utils/segment'

const segments = ref<Segment[]>([])
/**
 * segments aren't updated, so we can use computed with shallow reference changed.
 * when segments become realtime-update object, then refactoring this map.
 */
const segmentMap = new Map<Segment['id'], Segment>()
const segmentMapByStartPointId = new Map<Point['id'], Segment[]>()

function initSegments(segparts: ITrackData['segmentParts']) {
  segments.value = makeSegmentsFromParts(segparts ?? [])
  segments.value.forEach((s) => {
    // segmentMap
    segmentMap.set(s.id, s)

    // segmentMapByStartPoint
    const key = s.startPoint
    const value = segmentMapByStartPointId.get(key) ?? []
    segmentMapByStartPointId.set(key, [...value, s])
  })
}

function findSegmentById(id: number) {
  return segmentMap.get(id)
}

function setSegmentDisabled(
  id: Segment['id'],
  disabled: boolean,
  disabledByMtl: boolean
) {
  const segment = findSegmentById(id)
  if (segment === undefined) return

  segment.disabled = disabled
  segment.disabledByMtl = disabledByMtl
}

function findSegmentByPoints(startPointId: number, endPointId: number) {
  return segmentMapByStartPointId
    .get(startPointId)
    ?.find((s) => s.endPoint === endPointId)
}

function makeD(
  startPointId: number,
  endPointId: number,
  parts: SegmentPart[],
  length: number
) {
  const startPoint = findPointById(startPointId) ?? { x: 0, y: 0 }
  const endPoint = findPointById(endPointId) ?? { x: 0, y: 0 }

  return makeDFromSegment(startPoint, endPoint, parts, length)
}

export {
  segments,
  initSegments,
  findSegmentById,
  findSegmentByPoints,
  setSegmentDisabled,
  makeD,
}
