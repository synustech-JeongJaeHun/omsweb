import { ref, watch } from "vue";
import { Vehicle } from "./types/Vehicle";

const hoveredVehicle = ref<Vehicle>()

watch(hoveredVehicle, (hoveredVehicle, prevHoveredVehicle) => {
  if (prevHoveredVehicle)
    prevHoveredVehicle.isHovered = undefined

  if (hoveredVehicle)
    hoveredVehicle.isHovered = true
})

function setHoveredVehicle(hv?: Vehicle) {
  hoveredVehicle.value = hv
}

export { setHoveredVehicle }