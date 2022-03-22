import { ITrackData } from 'src/legacies/models/track.model'
import { UpdateDto } from 'src/types/Dto'
import { ref } from 'vue'
import { Zcu } from './types/Zcu'

const zcus = ref<Zcu[]>([])
const zcuMap = new Map<Zcu['id'], Zcu>()

function findZcuById(id: Zcu['id']) {
  return zcuMap.get(id)
}

function initZcus(zs: ITrackData['zcus']) {
  zcus.value = (zs ?? []).map((z) => ({ ...z }))
  zcus.value.forEach((z) => zcuMap.set(z.id, z))
}

function setZcu(updateData: UpdateDto.Zcu) {
  const zcu = findZcuById(updateData.id)

  if (zcu) Object.assign(zcu, updateData)
}
function deleteZcu(updateData: UpdateDto.Zcu) {
  const zcu = findZcuById(updateData.id)

  if (zcu) {
    const index = zcus.value.indexOf(zcu)
    zcus.value.splice(index, 1)
    zcuMap.delete(zcu.id)
  }
}

export { zcus, findZcuById, initZcus, setZcu, deleteZcu }
