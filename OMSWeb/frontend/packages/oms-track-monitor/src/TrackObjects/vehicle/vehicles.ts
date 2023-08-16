import { IVehicle } from 'src/legacies/models/track.model'
import { UpdateDto } from 'src/types/Dto'
import { getPositionFromD } from 'src/utils/svg/path'
import {readonly, ref} from 'vue'
import { findPointById } from '../point/points'
import { findSegmentByPoints } from '../segment/segments'
import { UpdateType, Vehicle } from './types/Vehicle'
import {Dto} from "@daimre/app/src/app/models/dto/track.model";

const vehicles = ref<Vehicle[]>([])
const vehicleMap = new Map<Vehicle['id'], Vehicle>()

const vhlIdPosition = ref<string>('')
const isVHLArrow = ref<boolean>(false)
const nextLine = ref<boolean>(false)
const vhlAlias = ref<string>('')
const readonlyVhlPosition = readonly(vhlIdPosition)
const readonlyVhlArrow = readonly(isVHLArrow)

const readonlyNextLine = readonly(nextLine)

const readonlyVHLAlias = readonly(vhlAlias)

function findVehicleById(id: number):Vehicle {
  return vehicles.value.find((v) => v.id === id)
  // return vehicleMap.get(id) // bug occur in playback
}

function initVehicles(vs: IVehicle[]) {
  // clean
  vehicles.value = []
  vehicleMap.clear()

  // set
  vehicles.value = vs.map((v) => ({ ...v }))
  vehicles.value.forEach((v) => vehicleMap.set(v.id, v))

  // sort by
  // 1)Disconnected 2) error 3) Manual 4) Maintenance 5) Idle
  vehicles.value.sort((a, b)=>
    compareDisconnect(b,a) ||
    compareError(b,a) ||
    compareManual(b,a) ||
    compareMaint(b,a)
  )
}

function setVehicle(v: UpdateDto.Vehicle) {
  const vehicle = findVehicleById(v.id)

  if (vehicle) {
    updateExistVehicle(vehicle, v)
  } else {
    vehicles.value.push(v)
    vehicleMap.set(v.id, v)
  }
}

function deleteVehicle(v: UpdateDto.Vehicle) {
  const vehicle = findVehicleById(v.id)

  if (vehicle) {
    const index = vehicles.value.indexOf(vehicle)
    vehicles.value.splice(index, 1)
    vehicleMap.delete(v.id)
  }
}

function getVehiclePosition(vehicle: Vehicle) {
  const segment = findSegmentByPoints(vehicle.curPoint, vehicle.nextPoint)
  return segment
    ? getPositionFromD(segment.d, vehicle.distancePoint)
    : findPointById(vehicle.curPoint)
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
function getUpdateType(
  vehicle: Vehicle,
  updateData: UpdateDto.Vehicle
): UpdateType {
  if (
    isInitialize(vehicle) ||
    isNotConnected(vehicle, updateData)
  )
    return 'NoAnimation'
  else if (isDiffInSameSegment(vehicle, updateData))
    return 'AnimationIn1Segment'
  else return 'AnimationIn2Segments'
}
function isInitialize(vehicle: Vehicle) {
  return vehicle.lastUpdated === undefined
}
function isNotConnected(vehicle: Vehicle, updateData: UpdateDto.Vehicle) {
  return !(vehicle.curPoint === updateData.curPoint ||
    vehicle.nextPoint === updateData.curPoint)
}
function isNoDiff(vehicle: Vehicle, updateData: UpdateDto.Vehicle) {
  return (
    vehicle.curPoint === updateData.curPoint &&
    vehicle.distancePoint === updateData.distancePoint
  )
}
function isDiffInSameSegment(
  vehicle: Vehicle,
  updateData: UpdateDto.Vehicle
) {
  return (
    vehicle.curPoint === updateData.curPoint ||
    (vehicle.nextPoint === updateData.curPoint &&
      (updateData.curPoint === updateData.nextPoint ||
        updateData.distancePoint === 0))
  )
}

let count = 0
function updateExistVehicle(
  vehicle: Vehicle,
  updateData: UpdateDto.Vehicle
) {
  const updateType = getUpdateType(vehicle, updateData)

  //vhl state afterimage processing
  updateData.locationPickup = updateData.locationPickup ?? ''
  updateData.locationDropoff = updateData.locationDropoff ?? ''
  updateData.locationMove = updateData.locationMove ?? ''

  Object.assign(vehicle, updateData)
  vehicle.updateType = updateType
  vehicle.lastUpdated = count++

  // sort by
  // 1)Disconnected 2) error 3) Manual 4) Maintenance 5) Idle
  if(vehicle.isMaint || !vehicle.isConnected || vehicle.errorList || vehicle.mode?.toUpperCase()==='M'){
    vehicles.value.sort((a, b)=>
      compareDisconnect(b,a) ||
      compareError(b,a) ||
      compareManual(b,a) ||
      compareMaint(b,a)
    )
  }
}

function updateVHLPosition(value: string) {
  vhlIdPosition.value = value
}

function updateVHLArrow(value: boolean) {
  isVHLArrow.value = value
}

function updateNextLine(value: boolean) {
  nextLine.value = value
}

function updateVHLAlias(value: string) {
  vhlAlias.value = value
}

function compareDisconnect(a:Dto.IVehicle, b:Dto.IVehicle ): number{
  if(a.isConnected && !b.isConnected) return 1
  else if(!a.isConnected && b.isConnected) return -1
  return 0
}

function compareError(a:Dto.IVehicle, b:Dto.IVehicle ): number{
  if(a.errorList && !b.errorList) return -1
  else if(!a.errorList && b.errorList) return 1
  return 0
}

function compareManual(a:Dto.IVehicle, b:Dto.IVehicle ): number{
  if(a.mode?.toUpperCase()==='M' && b.mode?.toUpperCase()!=='M') return -1
  else if(a.mode?.toUpperCase()!=='M' && b.mode?.toUpperCase()==='M') return 1
  return 0
}

function compareMaint(a:Dto.IVehicle, b:Dto.IVehicle ): number{
  if(a.isMaint && !b.isMaint) return 1
  else if(!a.isMaint && b.isMaint) return -1
  return 0
}

export {
  vehicles,
  initVehicles,
  setVehicle,
  deleteVehicle,
  getVehiclePosition,
  findVehicleById,
  readonlyVhlPosition,
  updateVHLPosition,
  updateVHLArrow,
  readonlyVhlArrow,
  updateNextLine,
  readonlyNextLine,
  updateVHLAlias,
  readonlyVHLAlias
}
