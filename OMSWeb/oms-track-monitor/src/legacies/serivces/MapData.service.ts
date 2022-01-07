interface MapDataService {
  data: {
    // Something else...
    /**
     * @deprecated Side Effect
     */
    vehicles: any[]  // SIDE-EFFECT
  }
  expectedPaths: unknown
  /**
   * @deprecated Side Effect
   */
  parseData: unknown // SIDE-EFFECT
  /**
   * @deprecated Side-Effect
   */
  applyVehicleData: unknown // SIDE-EFFECT
  /**
   * @deprecated Side Effect
   */
  applyDisableSegmentData: unknown // SIDE-EFFECT
  find_layout_object: unknown
  get_layout_objects: unknown
  find_point_coords: unknown
}

export { MapDataService }
