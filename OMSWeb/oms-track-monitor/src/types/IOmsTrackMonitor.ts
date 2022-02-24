import { IPreferences } from '../legacies/models/setting.model'
import { ITrackData } from '../legacies/models/track.model'
import { Vehicle } from '../vehicle/types/Vehicle'
import { UpdateDto } from './Dto'

interface IOmsTrackMonitor {
  // Get Data
  getCameraAndRotation(): {
    position: { x: number, y: number },
    viewBox: { width: number, height: number },
    rotation: number
  }

  // Set Data
  setPreference(preferences: IPreferences): void // is this needed?
  setTrack(track: ITrackData): void
  centerZoom(): void

  // track
  trackObject(type: "Vehicle", id: Vehicle['id']): void

  // Update Data
  updateVehicle(operation: UpdateDto.Operation, vehicle: UpdateDto.Vehicle): void
  // updateSegment(operation: UpdateDto.Operation, segment: UpdateDto.Segment): void
  updateSegmentDisabled(operation: UpdateDto.Operation, segmentDisabled: UpdateDto.SegmentDisabled): void,
  updateZcu(operation: UpdateDto.Operation, zcu: UpdateDto.Zcu): void
}

export { IOmsTrackMonitor }
