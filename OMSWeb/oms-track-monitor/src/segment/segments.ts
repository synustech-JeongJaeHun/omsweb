import { ref, watch } from "vue";
import { segmentDisableds } from "./segmentDisableds";
import { Segment } from "./types/Segment";

const segments = ref<Segment[]>([])

function findSegmentById(id: number) {
  return segments.value.find(s => s.id === id)
}

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


export { segments } 