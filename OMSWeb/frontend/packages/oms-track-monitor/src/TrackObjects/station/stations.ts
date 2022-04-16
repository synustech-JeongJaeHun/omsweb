import { ITrackData } from 'src/legacies/models/track.model'
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

export { stations, initStations, findStationById }
