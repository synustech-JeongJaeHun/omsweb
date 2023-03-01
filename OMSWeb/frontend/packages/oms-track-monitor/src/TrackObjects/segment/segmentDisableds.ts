import { ref } from 'vue'
import { setSegmentDisabled } from './segments'
import { Segment } from './types/Segment'
import { SegmentDisabled } from './types/SegmentDisabled'

const segmentDisableds = ref<SegmentDisabled[]>([])
const segmentDisabledMap = new Map<
	SegmentDisabled['id'],
	SegmentDisabled
>()
const segmentDisabledMapBySegmentId = new Map<
	Segment['id'],
	SegmentDisabled[]
>()

function initSegmentDisableds(sds: SegmentDisabled[]) {
	// clean
	segmentDisableds.value = []
	segmentDisabledMap.clear()
	segmentDisabledMapBySegmentId.clear()

	// set
	sds.forEach(insertSegmentDisabled)
}

function insertSegmentDisabled(segmentDisabled: SegmentDisabled) {
	// segmentDisableds
	segmentDisableds.value.push(segmentDisabled)
	segmentDisabledMap.set(segmentDisabled.id, segmentDisabled)
	segmentDisabledMapBySegmentId.set(segmentDisabled.segmentId, [
		...findSegmentDisabledsBySegmentId(segmentDisabled.segmentId),
		segmentDisabled,
	])

	// segments
	setSegmentDisabledWithMap(segmentDisabled.segmentId)
}

function deleteSegmentDisabled(id: SegmentDisabled['id']) {
	const segmentDisabled = findSegmentDisabledById(id)
	if (segmentDisabled === undefined) return

	//segmentdisabledbysegmentid
	const sds = findSegmentDisabledsBySegmentId(segmentDisabled.segmentId)
	const nextSds = sds.filter((sd) => sd.id !== segmentDisabled.id)
	segmentDisabledMapBySegmentId.set(segmentDisabled.segmentId, nextSds)

	// segmentDisableds
	const index = segmentDisableds.value.indexOf(segmentDisabled)
	segmentDisableds.value.splice(index, 1)
	segmentDisabledMap.delete(segmentDisabled.id)

	// segments
	setSegmentDisabledWithMap(segmentDisabled.segmentId)
}

function setSegmentDisabledWithMap(segmentId: Segment['id']) {
  const sds = findSegmentDisabledsBySegmentId(segmentId)

	const isDisabled = sds.length > 0
  const isDisabledByUser = isDisabled && sds.some((sd) =>
    sd.disabledBy.toUpperCase().includes('UID')
  )

	const isDisabledByMtl = isDisabled && sds.some((sd) =>
		sd.disabledBy.toUpperCase().includes('MTL')
	)
	const isDisabledByOnlyVehicle = isDisabled && sds.some((sd) =>
		sd.disabledBy.toUpperCase().includes('VID')
	)

	setSegmentDisabled(segmentId, isDisabled, isDisabledByMtl, isDisabledByOnlyVehicle, isDisabledByUser)
}

function findSegmentDisabledById(id: SegmentDisabled['id']) {
	return segmentDisabledMap.get(id)
}


function findSegmentDisabledsBySegmentId(id: Segment['id']) {
  return segmentDisabledMapBySegmentId.get(id) ?? []
}

export {
	segmentDisableds,
	initSegmentDisableds,
	insertSegmentDisabled,
	deleteSegmentDisabled,
  findSegmentDisabledsBySegmentId
}
