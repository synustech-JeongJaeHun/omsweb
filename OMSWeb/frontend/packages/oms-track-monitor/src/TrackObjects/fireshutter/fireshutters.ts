import { ITrackData } from 'src/legacies/models/track.model'
import { UpdateDto } from 'src/types/Dto'
import { ref } from 'vue'
import { Fireshutter } from './types/Fireshutter'

const fireshutters = ref<Fireshutter[]>([])
const fireshutterMap = new Map<Fireshutter['id'], Fireshutter>()

//implicate CR only

function findFireshutterById(id: Fireshutter['id']) {
	return fireshutterMap.get(id)
}

function initFireshutters(fs: ITrackData['fireShutters']) {
	// clean Map and ref
	fireshutters.value = []
	fireshutterMap.clear()

	//set values from server on ref
	fireshutters.value = (fs ?? []).map((f) => ({ ...f }))
	fireshutters.value.forEach((f) => fireshutterMap.set(f.id, f))
}

function updateFireshutter(updateData: UpdateDto.Fireshutter) {
	const fs = findFireshutterById(updateData.id)
	if (fs) Object.assign(fs, updateData)
}

export {
	fireshutters,
	findFireshutterById,
	initFireshutters,
	updateFireshutter,
}
