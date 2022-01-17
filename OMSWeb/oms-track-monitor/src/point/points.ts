import { computed, readonly, Ref, ref } from "vue";
import { Point } from './types/Point'

const points = ref<Point[]>([])

function findPointById(id: number) { return points.value.find(p => p.id === id) }

function usePointPoisiton(id: Ref<number>) {
  const point = computed(() => findPointById(id.value))
  const position = computed(() => point.value ? { x: point.value.x, y: point.value.y } : { x: 0, y: 0 })

  return readonly(position)
}

export { points, usePointPoisiton } 