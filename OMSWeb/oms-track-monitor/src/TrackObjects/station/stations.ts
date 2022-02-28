import { ref } from "vue";
import { Station } from './types/Station'

const stations = ref<Station[]>([])

function findStationById(id: Station['id']) { return stations.value.find(s => s.id === id) }

export { stations, findStationById } 