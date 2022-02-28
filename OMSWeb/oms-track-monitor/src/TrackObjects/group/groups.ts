import { Color } from "src/types/Color";
import { Ref, ref, watch } from "vue";
import { Group, ObjectInGroupType } from './types/Group'

const groups = ref<Group[]>([])

/**
 * apply rgba alpha 50%
 */
function findGroupColor(type: ObjectInGroupType, id: number) {
  const group = groups.value.find(g => g.objects.some(o => o.id === id && o.type === type))

  return group?.color
    ? `${Color[group.color]}80`
    : undefined
}

function useGroupColor(type: ObjectInGroupType, id: Ref<number>) {
  const color = ref(findGroupColor(type, id.value))
  watch([groups, id], () => {
    color.value = findGroupColor(type, id.value)
  })
  return color
}

export { groups, useGroupColor } 