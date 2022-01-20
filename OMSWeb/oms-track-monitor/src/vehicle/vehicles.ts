import { Ref, ref } from "vue";
import { IVehicle } from "../legacies/models/track.model";
import { UpdateType, Vehicle } from './types/Vehicle'

const vehicles = ref<Vehicle[]>([])

function findVehicleById(id: number) { return vehicles.value.find(v => v.id === id) }

/**
 * # Vehicle Update Strategy
 * 
 * ## types of update
 * 
 * 1. initialize 
 *    
 *    => fixed position
 * 2. is connected 
 *    
 *    => prev-current and current point are connected by 1 point
 *    = current Point has no diff || next point is same as prev-current point
 * 3. is not connected
 *    
 *    => prev-current point are not connected by 1 point
 * 
 * ## types of moving
 * 
 * 1. not moved
 * 2. moving in 1 segment
 * 3. moving in 2 segment
 * 
 * ## (types of update) X (types of moving)
 * 
 * 1. initialize X whatever
 * 
 *    => fixed position = current position + distanceFromPoint
 * 2. is connected X not moved
 * 
 *    == no diff in current point && no diff in current distanceFromPoint
 *    => fixed position = current position + distanceFromPoint
 * 3. is connected X moving in 1 segment 
 * 
 *    == no diff in current point && diff in current distanceFromPoint
 *    => moving in current segment
 *  => 🚗💨 ANIMATION
 * 4. is connected X moving in 2 segment
 * 
 *    == diff in current point
 *    => moving in prev + current segment
 *    => 🚗💨 ANIMATION
 * 5. is not connected X whatever
 * 
 *    => fixed position = current position + distanceFromPoint
 * 
 * ## result
 * 
 * 1. no animation
 *    - initialize X whatever
 *    - is connected X not moved
 *    - is not connected X whatever
 * 2. animation in 1 segment
 *    - is connected X moving in 1 segment 
 * 3. animation in 2 segment
 *    - is connected X moving in 2 segment 
 */
function updateExistVehicle(vehicle: Vehicle, updateData: IVehicle) {
  console.log("before", vehicle)
  const updateType: UpdateType = (function () {
    const isInitialize = vehicle.lastUpdated === undefined
    const isConnected = (vehicle.curPoint === updateData.curPoint
      || vehicle.nextPoint === updateData.curPoint)
    if (isInitialize || isConnected === false) return 'NoAnimation'

    const isNoDiff = (vehicle.curPoint === updateData.curPoint
      && vehicle.distancePoint === updateData.distancePoint)
    if (isNoDiff) return "NoAnimation"

    const isDiffInSameSegment = (vehicle.curPoint === updateData.curPoint)
    if (isDiffInSameSegment) return 'AnimationIn1Segment'
    else return 'AnimationIn2Segments'
  })()

  Object.assign(vehicle, updateData)
  vehicle.updateType = updateType
  vehicle.lastUpdated = Date.now()

  console.log("after", vehicle)
}

export { vehicles, findVehicleById, updateExistVehicle } 