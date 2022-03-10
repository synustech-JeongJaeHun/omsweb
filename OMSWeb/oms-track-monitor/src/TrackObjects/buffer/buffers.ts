import { computed, ref } from "vue";
import { Buffer } from './types/Buffer'

const buffers = ref<Buffer[]>([])

/**
 * buffer aren't updated, so we can use computed with shallow reference changed.
 * when buffer become realtime-update object, then refactoring this map.
 */
const bufferMap = computed(() => new Map(buffers.value.map((b) => [b.id, b])))

function findBufferById(id: Buffer['id']) { return bufferMap.value.get(id) }

export { buffers, findBufferById } 