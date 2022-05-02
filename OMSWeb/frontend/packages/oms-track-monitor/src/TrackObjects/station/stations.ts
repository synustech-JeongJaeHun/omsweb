import { ITrackData } from 'src/legacies/models/track.model'
import { UpdateDto } from 'src/types/Dto'
import { ref } from 'vue'
import { Station } from './types/Station'

const stations = ref<Station[]>([])
const stationMap = new Map<Station['id'], Station>()

/**
 * points aren't updated, so we can use computed with shallow reference changed.
 * when points become realtime-update object, then refactoring this map.
 */
function initStations(ss: ITrackData['stations']) {
	// clean
	stations.value = []
	stationMap.clear()

	// set
	stations.value = (ss ?? []).map((s) => ({ ...s }))
	stations.value.forEach((s) => stationMap.set(s.id, s))
}

function findStationById(id: Station['id']) {
	return stationMap.get(id)
}

function setStation(s: UpdateDto.Station) {
	const station = findStationById(s.id)

	if (station) {
		updateExistStation(station, s)
	}
}

function updateExistStation(
	station: Station,
	updateData: UpdateDto.Station
) {
	Object.assign(station, updateData)
}

export { stations, initStations, setStation, findStationById }
