import { ref } from "vue";
import { Vehicle } from './types/Vehicle'

const vehicles = ref<Vehicle[]>([])

function findVehicleById(id: number) { return vehicles.value.find(v => v.id === id) }

export { vehicles, findVehicleById } 