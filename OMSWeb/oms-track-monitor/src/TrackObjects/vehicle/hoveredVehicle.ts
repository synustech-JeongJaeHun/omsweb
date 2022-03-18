import { IsHovered } from './types/IsHovered'

let hoveredVehicle: IsHovered | undefined = undefined

function setHoveredVehicle(hv?: IsHovered) {
  // prev
  if (hoveredVehicle) hoveredVehicle.isHovered = undefined

  // now
  if (hv) {
    hv.isHovered = true
    hoveredVehicle = hv
  }
}

export { setHoveredVehicle }
