import { usePointPoisiton } from 'src/TrackObjects/point/points'
import { getPositionForBufferOfStationOffsetPosition } from 'src/TrackObjects/utils/locationStationBuffer'
import { computed, Ref } from 'vue'
import { findBufferById } from '../../buffer/buffers'
import { findStationById } from '../../station/stations'
import { Vehicle } from '../types/Vehicle'

// command, next line utils

function useNextPointPosition(vehicle: Ref<Vehicle>) {
  const nextPoint = computed(() => vehicle.value.nextPoint)
  const position = usePointPoisiton(nextPoint)
  return position
}

function parseTargetId(location: string) {
  const typeLetter = location[0].toLowerCase()
  const id = parseInt(location.slice(1))

  switch (typeLetter) {
    case 's':
      return findStationById(id)
    case 'b':
      return findBufferById(id)
    default:
      return undefined
  }
}

function useCommandPointPosition(vehicle: Ref<Vehicle>) {
  const type = computed(() =>
    vehicle.value.commandPoint === vehicle.value.locationDropoff
      ? 'dropoff'
      : vehicle.value.commandPoint === vehicle.value.locationPickup
      ? 'pickup'
      : undefined
  )

  const position = computed(() => {
    const commandTarget = vehicle.value.commandPoint
      ? parseTargetId(vehicle.value.commandPoint)
      : undefined

    const nextLocation = [
      vehicle.value.locationPickup,
      vehicle.value.locationDropoff,
    ]
      .filter((notNullish) => notNullish)
      .map((location) => parseTargetId(location!))
      .filter((notNullish) => notNullish)
      .find((location) => location!.pointId === commandTarget?.pointId)

    return nextLocation
      ? getPositionForBufferOfStationOffsetPosition(nextLocation)
      : undefined
  })

  return { type, position }
}

export { useNextPointPosition, useCommandPointPosition }
