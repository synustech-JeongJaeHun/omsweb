import { ITrackData } from 'src/legacies/models/track.model'
import { computed, readonly, Ref, ref } from 'vue'
import { Point } from './types/Point'

const points = ref<Point[]>([])
/**
 * points aren't updated, so we can use computed with shallow reference changed.
 * when points become realtime-update object, then refactoring this map.
 */

const pointMap = new Map<Point['id'], Point>()

function initPoints(ps: ITrackData['points']) {
  points.value = (ps ?? []).map((p) => ({ ...p }))
  points.value.forEach((p) => pointMap.set(p.id, p))
}

function findPointById(id: Point['id']) {
  return pointMap.get(id)
}

function usePointPoisiton(id: Ref<Point['id']>) {
  const position = computed(() => {
    const point = findPointById(id.value)
    return point ? { x: point.x, y: point.y } : undefined
  })

  return readonly(position)
}

export { points, initPoints, findPointById, usePointPoisiton }
