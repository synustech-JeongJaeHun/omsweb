interface IOmsTrackMonitor {
  // Get Data
  getCameraAndRotation(): {
    position: { x: number, y: number },
    viewBox: { width: number, height: number },
    rotation: number
  }

  // Set Data
  setPreference(preferences: any): void // is this needed?
  setTrack(track: any): void
  centerZoom(): void

  // find
  find(type: string, id: number): void

  // focus
  focus(type: string, id: number): void

  // track
  track(type: string, id: number): void

  // Update Data
  updateVehicle(operation: string, vehicle: any): void
  // updateSegment(operation: UpdateDto.Operation, segment: UpdateDto.Segment): void
  updateSegmentDisabled(operation: string, segmentDisabled: any): void,
  updateZcu(operation: string, zcu: any): void
}

export { IOmsTrackMonitor }
