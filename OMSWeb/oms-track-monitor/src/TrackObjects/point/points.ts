import { computed, readonly, Ref, ref } from "vue";
import { Point } from './types/Point'

const points = ref<Point[]>([])

function findPointById(id: Point['id']) { return points.value.find(p => p.id === id) }

function usePointPoisiton(id: Ref<Point['id']>) {
  const point = computed(() => findPointById(id.value))
  const position = computed(() => point.value ? { x: point.value.x, y: point.value.y } : undefined)

  return readonly(position)
}

export { points, findPointById, usePointPoisiton } 