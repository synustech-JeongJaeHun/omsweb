import { ITrackData } from 'src/legacies/models/track.model'
import { UpdateDto } from 'src/types/Dto'
import { ref } from 'vue'
import { Buffer } from './types/Buffer'

const buffers = ref<Buffer[]>([])
const bufferMap = new Map<Buffer['id'], Buffer>()

function initBuffers(bs: ITrackData['buffers']) {
	// clean
	buffers.value = []
	bufferMap.clear()

	// set
	buffers.value = (bs ?? []).map((b) => ({ ...b }))
	buffers.value.forEach((b) => bufferMap.set(b.id, b))
}

function setBuffer(s: UpdateDto.Buffer) {
	const buffer = findBufferById(s.id)

	if (buffer) {
		updateExistBuffer(buffer, s)
	}
}

function updateExistBuffer(
	buffer: Buffer,
	updateData: UpdateDto.Buffer
) {
	Object.assign(buffer, updateData)
}

function findBufferById(id: Buffer['id']) {
	return bufferMap.get(id)
}

export { buffers, initBuffers, setBuffer, findBufferById }
