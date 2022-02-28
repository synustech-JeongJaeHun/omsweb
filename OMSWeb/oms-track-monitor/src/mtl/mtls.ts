import { ref } from "vue";
import { Mtl } from './types/Mtl'

const mtls = ref<Mtl[]>([])

function findMtlById(id: Mtl['id']) { return mtls.value.find(m => m.id === id) }

export { mtls, findMtlById } 