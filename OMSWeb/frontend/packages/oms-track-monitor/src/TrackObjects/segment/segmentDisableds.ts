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

function initSegmentDisableds(sds: SegmentDisabled[]) { //트렉데이터
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
	segmentDisabledMap.set(segmentDisabled.id, segmentDisabled) //disabled맵 세팅
  segmentDisabledMapBySegmentId.set(segmentDisabled.segmentId, [ 
		...findSegmentDisabledsBySegmentId(segmentDisabled.segmentId),
		segmentDisabled,
	])

	// segments
  setSegmentDisabledWithMap(segmentDisabled.segmentId) //정보로 맵에서 disabled처리
}

function deleteSegmentDisabled(id: SegmentDisabled['id']) {
  //디비에서 delete 된 SegmentDisabled 반복
  const segmentDisabled = findSegmentDisabledById(id)
  if (segmentDisabled === undefined) return

  const sds = findSegmentDisabledsBySegmentId(segmentDisabled.segmentId)
  const nextSds = sds.filter((sd) => sd.id !== segmentDisabled.id)
  segmentDisabledMapBySegmentId.set(segmentDisabled.segmentId, nextSds)

  // segmentDisableds
  //sds.map(s => {
  //  const index = segmentDisableds.value.indexOf(s)
  //  segmentDisableds.value.splice(index, 1)
  //  segmentDisabledMap.delete(s.id)

  //  // segments
  //  setSegmentDisabledWithMap(s.segmentId) 
  //})
  const nextSdsIds = new Set(nextSds.map((ns) => ns.id));

  // sds 순회하며 nextSds 포함 여부에 따라 분기 처리
  sds.map((s) => {
    if (!nextSdsIds.has(s.id)) {
      const index = segmentDisableds.value.indexOf(s);
      if (index !== -1) {
        segmentDisableds.value.splice(index, 1);
      }
      segmentDisabledMap.delete(s.id);

      // segments
      setSegmentDisabledWithMap(s.segmentId);
   
    }
  });

}

function setSegmentDisabledWithMap(segmentId: Segment['id']) {
  //맵에서 segmentDisabled처리 위한 곳 세그먼트ID를 통해 처리

  //id값을 받아서 해당 세그먼트의 
  
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
