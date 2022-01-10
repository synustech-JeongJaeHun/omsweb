import { ref } from "vue";
import { Vehicle } from './types/Vehicle'

const vehicles = ref<Vehicle[]>([])

export { vehicles } 