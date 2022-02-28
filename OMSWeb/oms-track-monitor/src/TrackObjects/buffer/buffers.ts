import { ref } from "vue";
import { Buffer } from './types/Buffer'

const buffers = ref<Buffer[]>([])

function findBufferById(id: Buffer['id']) { return buffers.value.find(b => b.id === id) }

export { buffers, findBufferById } 