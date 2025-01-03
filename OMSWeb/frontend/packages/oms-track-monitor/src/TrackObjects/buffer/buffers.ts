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

function setCarrier(c: UpdateDto.Carrier) {

  const buffer = findBufferById(c.bufferId); //캐리어 notify

  if (buffer) {
    //Id로 버퍼 찾아서 복사 후 캐리어 변경 업데이트
    const updateBuffer: any = Object.assign({}, buffer);
    updateBuffer.installed = c.installed;
    updateBuffer.alertPassedTime = c.alertPassedTime;
    /*CarrierEmptyStatus */ //얜 기존 버퍼
/*    updateBuffer.carrierLocation = c.carrierLocation;*/

    updateExistBuffer(buffer, updateBuffer)

  }
}

function findCarrierUpdateBufferId(value: any) {
  for (const [mapKey, proxyObj] of bufferMap) {
    const target: Buffer = proxyObj;
    if (target.id === value) {
      return target.id; // 키를 반환(buffer id)
    }
  }
  return null;
}





export { buffers, initBuffers, setBuffer, findBufferById, setCarrier }
