import { ref } from "vue";
import { Point } from './types/Point'

const points = ref<Point[]>([])

function findPointById(id: number) {
  return points.value.find(p => p.id === id)
}

export { points, findPointById } 