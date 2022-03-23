import { ITrackData } from 'src/legacies/models/track.model'
import { Color } from 'src/types/Color'
import { computed, Ref, ref } from 'vue'
import { Group, ObjectInGroupType } from './types/Group'

const groups = ref<Group[]>([])

function initGroups(gs: ITrackData['groups']) {
  groups.value = (gs ?? []).map((g) => ({
    ...g,
    color: g.color as keyof typeof Color,
  }))
}

function findGroupByTypeAndObjectId(type: ObjectInGroupType, id: number) {
  return groups.value.find((g) =>
    g.objects.some((o) => o.id === id && o.type === type)
  )
}

function useGroup(type: ObjectInGroupType, id: Ref<number>) {
  return computed(() => findGroupByTypeAndObjectId(type, id.value))
}

export { groups, initGroups, useGroup }
