import { Ref, ref, watchEffect } from "vue";
import { Group, ObjectInGroupType } from './types/Group'
import { getGroupColorWithAlpha } from "./utils/color";

const groups = ref<Group[]>([])

function findGroupByTypeAndObjectId(type: ObjectInGroupType, id: number) {
  return groups.value.find(g => g.objects.some(o => o.id === id && o.type === type))
}

function useGroup(type: ObjectInGroupType, id: Ref<number>) {
  const group = ref<Group>()

  watchEffect(() => {
    group.value = findGroupByTypeAndObjectId(type, id.value)
  })

  return group
}

function useGroupColor(type: ObjectInGroupType, id: Ref<number>) {
  const group = useGroup(type, id)
  const color = ref<string>()

  watchEffect(() => {
    color.value = group.value
      ? getGroupColorWithAlpha(group.value.color)
      : undefined
  })
  return color
}

export { groups, useGroup, useGroupColor } 