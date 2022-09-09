import {
  findPointById,
  usePointPoisiton,
} from 'src/TrackObjects/point/points'
import { Station } from 'src/TrackObjects/station/types/Station'
import { Buffer } from 'src/TrackObjects/buffer/types/Buffer'
import { Point } from 'src/TrackObjects/point/types/Point'
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
type ParsedResultByTargetId =
  | (Station & { type: 'station' })
  | (Buffer & { type: 'buffer' })
  | (Point & { type: 'point' })
  | undefined

function parseTargetId(location: string): ParsedResultByTargetId {
  const typeLetter = location[0].toLowerCase()
  const id = parseInt(location.slice(1))

  switch (typeLetter) {
    case 's':
      const station = findStationById(id)
      return station ? { ...station, type: 'station' } : undefined
    case 'b':
      const buffer = findBufferById(id)
      return buffer ? { ...buffer, type: 'buffer' } : undefined
    case 'p':
      const point = findPointById(id)
      return point ? { ...point, type: 'point' } : undefined
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
      : vehicle.value.commandPoint === vehicle.value.locationMove
      ? 'move'
      : undefined
  )

  const position = computed(() => {
    const commandTarget = vehicle.value.commandPoint
      ? parseTargetId(vehicle.value.commandPoint)
      : undefined

    const nextLocation = [
      vehicle.value.locationPickup,
      vehicle.value.locationDropoff,
      vehicle.value.locationMove,
    ]
      .filter((notNullish) => notNullish)
      .map((location) => parseTargetId(location!))
      .filter((notNullish) => notNullish)
      .find((location) => {
        if (
          (location?.type === 'buffer' &&
            commandTarget?.type === 'buffer') ||
          (location?.type === 'station' &&
            commandTarget?.type === 'station')
        )
          return location?.pointId === commandTarget?.pointId
        else return location?.id === commandTarget?.id
      })

    if (nextLocation?.type === 'point')
      return { x: nextLocation.x, y: nextLocation.y }
    else
      return nextLocation
        ? getPositionForBufferOfStationOffsetPosition(nextLocation)
        : undefined
  })

  return { type, position }
}

export { useNextPointPosition, useCommandPointPosition }
