import { IVehicle } from "src/legacies/models/track.model";
import { UpdateDto } from "src/types/Dto";
import { ref } from "vue";
import { UpdateType, Vehicle } from './types/Vehicle'

const vehicles = ref<Vehicle[]>([])
const vehicleMap = new Map<Vehicle['id'], Vehicle>()

function findVehicleById(id: number) { return vehicleMap.get(id) }

function initVehicles(vs: IVehicle[]){
  vehicles.value = vs
  vehicles.value.forEach(v => vehicleMap.set(v.id, v))
}

function setVehicle(v: UpdateDto.Vehicle){
  const vehicle = findVehicleById(v.id)

  if(vehicle){ 
    updateExistVehicle(vehicle, v)
  }
  else {
    vehicles.value.push(v)
    vehicleMap.set(v.id, v)
  }
}


function deleteVehicle(v: UpdateDto.Vehicle){
  const vehicle = findVehicleById(v.id)

  if(vehicle) {
    const index = vehicles.value.indexOf(vehicle)
    vehicles.value.splice(index, 1)
    vehicleMap.delete(v.id)
  }
}


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
function getUpdateType(vehicle: Vehicle, updateData: UpdateDto.Vehicle): UpdateType {
  if (isInitialize(vehicle) || isNotConnected(vehicle, updateData) || isNoDiff(vehicle, updateData))
    return 'NoAnimation'
  else if (isDiffInSameSegment(vehicle, updateData))
    return 'AnimationIn1Segment'
  else
    return 'AnimationIn2Segments'
}
function isInitialize(vehicle: Vehicle) { return vehicle.lastUpdated === undefined }
function isNotConnected(vehicle: Vehicle, updateData: UpdateDto.Vehicle) { return (vehicle.curPoint === updateData.curPoint || vehicle.nextPoint === updateData.curPoint) === false }
function isNoDiff(vehicle: Vehicle, updateData: UpdateDto.Vehicle) { return vehicle.curPoint === updateData.curPoint && vehicle.distancePoint === updateData.distancePoint }
function isDiffInSameSegment(vehicle: Vehicle, updateData: UpdateDto.Vehicle) {
  return vehicle.curPoint === updateData.curPoint
    || (vehicle.nextPoint === updateData.curPoint
      && (updateData.curPoint === updateData.nextPoint || updateData.distancePoint === 0))
}

function updateExistVehicle(vehicle: Vehicle, updateData: UpdateDto.Vehicle) {
  const updateType = getUpdateType(vehicle, updateData)

  Object.assign(vehicle, updateData)
  vehicle.updateType = updateType
  vehicle.lastUpdated = Date.now()
}

export { vehicles, initVehicles, setVehicle, deleteVehicle, findVehicleById, updateExistVehicle } 