import { ITrackData } from 'src/legacies/models/track.model'
import { ref } from 'vue'
import { Mtl } from './types/Mtl'

const mtls = ref<Mtl[]>([])
const mtlMap = new Map<Mtl['id'], Mtl>()

function initMtls(ms: ITrackData['mtls']) {
	// clean
	mtls.value = []
	mtlMap.clear()

	// set
	mtls.value = (ms ?? []).map((m) => ({ ...m }))
	mtls.value.forEach((m) => mtlMap.set(m.id, m))
}

function findMtlById(id: Mtl['id']) {
	return mtlMap.get(id)
}

export { mtls, initMtls, findMtlById }
