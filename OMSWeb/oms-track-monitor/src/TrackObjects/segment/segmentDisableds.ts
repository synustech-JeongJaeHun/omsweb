import { ref } from "vue";
import { setSegmentDisabled } from "./segments";
import { SegmentDisabled } from './types/SegmentDisabled'

const segmentDisableds = ref<SegmentDisabled[]>([])

function initSegmentDisableds(sds: SegmentDisabled[]) {
  sds.forEach(insertSegmentDisabled);
}

function insertSegmentDisabled(segmentDisabled: SegmentDisabled) {
  // segments
  setSegmentDisabled(segmentDisabled.segmentId, true)

  // segmentDisableds
  segmentDisableds.value.push(segmentDisabled)
}

function deleteSegmentDisabled(id: SegmentDisabled['id']) {
  const segmentDisabled = findSegmentDisabledById(id)

  if (segmentDisabled) {
    // segments
    setSegmentDisabled(segmentDisabled.segmentId, false)

    // segmentDisableds
    const index = segmentDisableds.value.indexOf(segmentDisabled)
    segmentDisableds.value.splice(index, 1)
  }
}

function findSegmentDisabledById(id: SegmentDisabled['id']) {
  return segmentDisableds.value.find(sd => sd.id === id)
}

export {
  segmentDisableds, findSegmentDisabledById,
  initSegmentDisableds
  , insertSegmentDisabled, deleteSegmentDisabled
} 