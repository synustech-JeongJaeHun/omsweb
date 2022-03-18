import { getPositionForBufferOrStation } from 'src/TrackObjects/utils/locationStationBuffer'
import { computed, Ref } from 'vue'
import { findBufferById } from '../../buffer/buffers'
import { findStationById } from '../../station/stations'
import { Vehicle } from '../types/Vehicle'

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

function useCommandPointPosition(
  pickup: Ref<Vehicle['locationPickup']>,
  dropoff: Ref<Vehicle['locationDropoff']>,
  commandPoint: Ref<Vehicle['commandPoint']>
) {
  const commandTarget = computed(() =>
    commandPoint.value ? parseTargetId(commandPoint.value) : undefined
  )

  const nextLocation = computed(() =>
    [pickup.value, dropoff.value]
      .filter((notNullish) => notNullish)
      .map((location) => parseTargetId(location!))
      .filter((notNullish) => notNullish)
      .find(
        (location) => location!.pointId === commandTarget.value?.pointId
      )
  )

  const type = computed(() =>
    commandPoint.value === dropoff.value
      ? 'dropoff'
      : commandPoint.value === pickup.value
      ? 'pickup'
      : undefined
  )

  const position = computed(() =>
    nextLocation.value
      ? getPositionForBufferOrStation(nextLocation.value)
      : undefined
  )

  return { type, position }
}

export { useCommandPointPosition }
