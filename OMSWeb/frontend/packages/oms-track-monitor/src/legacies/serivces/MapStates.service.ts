interface MapStatesService {
  vehicleTrackingState: unknown
  actionState$: unknown
  /**
   * @deprecated Side Effect
   */
  resetVehicleTrackingState: unknown // SIDE-EFFECT
  /**
   * @deprecated Side Effect
   */
  preferences: unknown // SIDE-EFFECT
}

export { MapStatesService }
