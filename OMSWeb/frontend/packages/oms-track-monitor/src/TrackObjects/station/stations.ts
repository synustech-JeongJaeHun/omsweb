import { ITrackData } from 'src/legacies/models/track.model'
import { UpdateDto } from 'src/types/Dto'
import {readonly, ref} from 'vue'
import { Station } from './types/Station'

const stations = ref<Station[]>([])
const stationMap = new Map<Station['id'], Station>()

const includeWords = ref<string[]>([])

/**
 * points aren't updated, so we can use computed with shallow reference changed.
 * when points become realtime-update object, then refactoring this map.
 */
function initStations(ss: ITrackData['stations']) {
	// clean
	stations.value = []
	stationMap.clear()

	// set
	stations.value = (ss ?? []).map((s) => {
    s.carrierId = includeCheck(s.logicalId) ? s?.carrierId : ''
    return { ...s }
  })
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
  updateData.carrierId = includeCheck(station.logicalId) ? updateData?.carrierId : ''
	Object.assign(station, updateData)
}

function updateIncludesWords(value: string[]) {
  includeWords.value = value
}

function includeCheck(word: string){
  return includeWords.value.some((i: string)=>word.includes(i))
}

export { stations, initStations, setStation, findStationById, updateIncludesWords }
