import { ref } from 'vue'
import { setSegmentDisabled } from './segments'
import { SegmentDisabled } from './types/SegmentDisabled'

const segmentDisableds = ref<SegmentDisabled[]>([])
const segmentDisabledMap = new Map<
  SegmentDisabled['id'],
  SegmentDisabled
>()

function initSegmentDisableds(sds: SegmentDisabled[]) {
  sds.forEach(insertSegmentDisabled)
}

function insertSegmentDisabled(segmentDisabled: SegmentDisabled) {
  // segments
  setSegmentDisabled(
    segmentDisabled.segmentId,
    true,
    segmentDisabled.disabledBy.toUpperCase().includes('MTL')
  )

  // segmentDisableds
  segmentDisableds.value.push(segmentDisabled)
  segmentDisabledMap.set(segmentDisabled.id, segmentDisabled)
}

function deleteSegmentDisabled(id: SegmentDisabled['id']) {
  const segmentDisabled = findSegmentDisabledById(id)

  if (segmentDisabled) {
    // segments
    setSegmentDisabled(segmentDisabled.segmentId, false, false)

    // segmentDisableds
    const index = segmentDisableds.value.indexOf(segmentDisabled)
    segmentDisableds.value.splice(index, 1)
    segmentDisabledMap.delete(segmentDisabled.id)
  }
}

function findSegmentDisabledById(id: SegmentDisabled['id']) {
  return segmentDisabledMap.get(id)
  // return segmentDisableds.value.find(sd => sd.id === id)
}

export {
  segmentDisableds,
  findSegmentDisabledById,
  initSegmentDisableds,
  insertSegmentDisabled,
  deleteSegmentDisabled,
}
