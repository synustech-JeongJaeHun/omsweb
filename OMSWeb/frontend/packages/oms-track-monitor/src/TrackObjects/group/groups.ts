import { IGroup, ITrackData } from 'src/legacies/models/track.model'
import { Color } from 'src/types/Color'
import { UpdateDto } from 'src/types/Dto'
import { computed, Ref, ref } from 'vue'
import { Group, ObjectInGroupType } from './types/Group'

const groups = ref<Group[]>([])
const sortedByIdAscendingGroups = computed(() => groups.value.slice().sort((a,b) => a.id - b.id))

function initGroups(gs: ITrackData['groups']) {
	groups.value = (gs ?? []).map((g) => ({
		...g,
		color: g.color as keyof typeof Color,
	}))
}

function findGroupByTypeAndObjectId(type: ObjectInGroupType, id: number) {
	return sortedByIdAscendingGroups.value.find((g) =>
		g.objects.some((o) => o.id === id && o.type === type)
	)
}

function findGroupById(id: Group['id']) {
	return groups.value.find((g) => g.id === id)
}

function useGroup(type: ObjectInGroupType, id: Ref<number>) {
	return computed(() => findGroupByTypeAndObjectId(type, id.value))
}

function insertGroupObject(go: UpdateDto.GroupObject) {
	const group = findGroupById(go.groupId)

	if (group)
		group.objects.push({ id: go.referenceId, type: go.referenceTable })
}
function updateGroupObject(data: IGroup[]) {
	initGroups(data)
}
function deleteGroupObject(go: UpdateDto.GroupObject) {
	const group = findGroupById(go.groupId)

	if (group) {
		const index = group.objects.findIndex(
			(o) => o.id === go.referenceId && o.type === go.referenceTable
		)
		if (index > -1) group.objects.splice(index, 1)
	}
}

export {
	groups,
	initGroups,
	useGroup,
	insertGroupObject,
	updateGroupObject,
	deleteGroupObject,
}
