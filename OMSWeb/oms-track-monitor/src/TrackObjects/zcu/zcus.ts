import { UpdateDto } from "src/types/Dto";
import { ref } from "vue";
import { Zcu } from './types/Zcu'

const zcus = ref<Zcu[]>([])

function findZcuById(id: Zcu['id']) { return zcus.value.find(z => z.id === id) }

function updateExistZcu(zcu: Zcu, updateData: UpdateDto.Zcu) {
  Object.assign(zcu, updateData)
}

export { zcus, findZcuById, updateExistZcu } 