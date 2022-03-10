import { computed, ref } from "vue";
import { Station } from './types/Station'

const stations = ref<Station[]>([])

/**
 * points aren't updated, so we can use computed with shallow reference changed.
 * when points become realtime-update object, then refactoring this map.
 */
const stationMap = computed(() => new Map(stations.value.map(s => [s.id, s])))

function findStationById(id: Station['id']) { return stationMap.value.get(id) }

export { stations, findStationById } 