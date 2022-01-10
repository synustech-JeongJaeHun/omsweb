import { ref, watchEffect } from "vue";
import { Point } from './types/Point'

const points = ref<Point[]>([])

watchEffect(() => console.log(points.value))

export { points } 