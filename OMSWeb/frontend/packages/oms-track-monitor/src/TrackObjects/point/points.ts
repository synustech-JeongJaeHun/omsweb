import { ITrackData } from 'src/legacies/models/track.model'
import { UpdateDto } from 'src/types/Dto'
import { computed, readonly, Ref, ref } from 'vue'
import { Point } from './types/Point'

const points = ref<Point[]>([])
/**
 * points aren't updated, so we can use computed with shallow reference changed.
 * when points become realtime-update object, then refactoring this map.
 */

const pointMap = new Map<Point['id'], Point>()

function initPoints(ps: ITrackData['points']) {
	// clean
	points.value = []
	pointMap.clear()

	// set
	points.value = (ps ?? []).map((p) => ({ ...p }))
	points.value.forEach((p) => pointMap.set(p.id, p))
}

function findPointById(id: Point['id']) {
	return pointMap.get(id)
}

function usePointPoisiton(id: Ref<Point['id']>) {
	const position = computed(() => {
		const point = findPointById(id.value)
		return point ? { x: point.x, y: point.y } : undefined
	})

	return readonly(position)
}

function insertHomeToPoint(home: UpdateDto.Home) {
	const point = pointMap.get(home.point)
	if (point) point.homeId = home.id
}
function updateHomeToPoint(home: UpdateDto.Home) {
	const pointByHomeId = points.value.find((p) => p.homeId === home.id)
	const pointByHomePoint = pointMap.get(home.point)

	if (pointByHomeId) pointByHomeId.homeId = undefined
	if (pointByHomePoint) pointByHomePoint.homeId = home.id
}
function deleteHomeToPoint(home: UpdateDto.Home) {
	const point = pointMap.get(home.point)
	if (point) point.homeId = undefined
}

export {
	points,
	initPoints,
	findPointById,
	usePointPoisiton,
	insertHomeToPoint,
	updateHomeToPoint,
	deleteHomeToPoint,
}
