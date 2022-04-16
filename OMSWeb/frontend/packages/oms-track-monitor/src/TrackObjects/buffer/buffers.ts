import { ITrackData } from 'src/legacies/models/track.model'
import { ref } from 'vue'
import { Buffer } from './types/Buffer'

const buffers = ref<Buffer[]>([])
const bufferMap = new Map<Buffer['id'], Buffer>()

/**
 * buffer aren't updated, so we can use computed with shallow reference changed.
 * when buffer become realtime-update object, then refactoring this map.
 */
function initBuffers(bs: ITrackData['buffers']) {
	// clean
	buffers.value = []
	bufferMap.clear()

	// set
	buffers.value = (bs ?? []).map((b) => ({ ...b }))
	buffers.value.forEach((b) => bufferMap.set(b.id, b))
}

function findBufferById(id: Buffer['id']) {
	return bufferMap.get(id)
}

export { buffers, initBuffers, findBufferById }
