import { ITrackData } from 'src/legacies/models/track.model'
import { UpdateDto } from 'src/types/Dto'
import { ref } from 'vue'
import { FireShutter } from './types/Fireshutter'

const fireshutters = ref<FireShutter[]>([])
const fireshutterMap = new Map<FireShutter['id'], FireShutter>()

//implicate CR only

function findFireshutterById(id: FireShutter['id']) {
	return fireshutterMap.get(id)
}

function initFireshutters(fs: ITrackData['fireshutters']) {
	// clean Map and ref
	fireshutters.value = []
	fireshutterMap.clear()

	//set values from server on ref
	fireshutters.value = (fs ?? []).map((f) => ({ ...f }))
	fireshutters.value.forEach((f) => fireshutterMap.set(f.id, f))
}

function setFireshutter(updateData: UpdateDto.FireShutter) {
	const fs = findFireshutterById(updateData.id)
	if (fs) Object.assign(fs, updateData)
}

export {
	fireshutters,
	findFireshutterById,
	initFireshutters,
	setFireshutter,
}
