import { computed, readonly, Ref, ref } from "vue";
import { Point } from './types/Point'

const points = ref<Point[]>([])
/**
 * points aren't updated, so we can use computed with shallow reference changed.
 * when points become realtime-update object, then refactoring this map.
 */
const pointMap = computed(() => new Map(points.value.map(p => [p.id, p])))

function findPointById(id: Point['id']) { return pointMap.value.get(id) }
// function findPointById(id: Point['id']) { return points.value.find(p => p.id === id) }

function usePointPoisiton(id: Ref<Point['id']>) {
  const point = computed(() => findPointById(id.value))
  const position = computed(() => point.value ? { x: point.value.x, y: point.value.y } : undefined)

  return readonly(position)
}

export { points, findPointById, usePointPoisiton } 