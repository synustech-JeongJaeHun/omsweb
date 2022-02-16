import { computed, readonly, Ref, watchEffect } from "vue"
import { findBufferById } from "../../buffer/buffers"
import { findStationById } from "../../station/stations"
import { getPositionForBufferOrStation } from "../../utils/locationStationBuffer"
import { Vehicle } from "../types/Vehicle"

function parseTargetId(location: string) {
  const typeLetter = location[0].toLowerCase()
  const id = parseInt(location.slice(1))

  switch (typeLetter) {
    case "s":
      return findStationById(id)
    case "b":
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
  const candidates = readonly(computed(() => [pickup.value, dropoff.value]))
  const commandTarget = readonly(computed(() =>
    commandPoint.value ? parseTargetId(commandPoint.value) : undefined))

  const nextLocation = readonly(computed(() =>
    candidates.value
      .filter(notNullish => notNullish)
      .map(location => parseTargetId(location!))
      .filter(notNullish => notNullish)
      .find(location => location!.pointId === commandTarget.value?.pointId)
  ))

  const type = readonly(computed(() =>
    commandPoint.value === dropoff.value ? "dropoff" :
      commandPoint.value === pickup.value ? "pickup" :
        undefined
  ))

  const position = readonly(computed(() =>
    nextLocation.value
      ? getPositionForBufferOrStation(nextLocation.value)
      : undefined
  ))

  return { type, position }
}

export { useCommandPointPosition }