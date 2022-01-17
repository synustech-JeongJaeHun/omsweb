import { computed, readonly, Ref } from "vue";
import { usePointPoisiton } from "../../point/points";
import { Segment } from "../types/Segment";
import { SegmentPart } from "../types/SegmentPart";

function usePath(segment: Ref<Segment>) {
  const startPointPosition = usePointPoisiton(computed(() => segment.value.startPoint))
  const nextPointPosition = usePointPoisiton(computed(() => segment.value.endPoint))
  const path = computed(() => makePathFromSegment(startPointPosition.value, nextPointPosition.value, segment.value.parts))

  return readonly(path)
}

type Position = { x: number, y: number }
type Path = string
function makePathFromSegment(startPointPosition: Position, endPointPosition: Position, parts: SegmentPart[]): Path {
  if (parts.length === 1) {
    return `M ${startPointPosition.x} ${startPointPosition.y} L ${endPointPosition.x} ${endPointPosition.y}`
  } else if (parts.length === 3) {
    return ``
  } else if (parts.length === 5) {
    return ``
  } else {
    return ``
  }
}

export { usePath }