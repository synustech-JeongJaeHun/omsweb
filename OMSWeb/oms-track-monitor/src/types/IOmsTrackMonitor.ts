import { IPreferences } from '../legacies/models/setting.model'
import { ITrackData } from '../legacies/models/track.model'
import { Point } from '../point/types/Point'
import { Segment } from '../segment/types/Segment'
import { Station } from '../station/types/Station'
import { Vehicle } from '../vehicle/types/Vehicle'
import { Buffer } from '../buffer/types/Buffer'
import { UpdateDto } from './Dto'
import { Mtl } from '../mtl/types/Mtl'

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

  // find
  find(type: "vehicle", id: Vehicle['id']): void
  find(type: "point", id: Point['id']): void
  find(type: "segment", id: Segment['id']): void
  find(type: "station", id: Station['id']): void
  find(type: "buffer", id: Buffer['id']): void
  find(type: "mtl", id: Mtl['id']): void

  // focus
  focus(type: "vehicle", id: Vehicle['id']): void
  focus(type: "point", id: Point['id']): void
  focus(type: "segment", id: Segment['id']): void
  focus(type: "station", id: Station['id']): void
  focus(type: "buffer", id: Buffer['id']): void
  focus(type: "mtl", id: Mtl['id']): void

  // Update Data
  updateVehicle(operation: UpdateDto.Operation, vehicle: UpdateDto.Vehicle): void
  // updateSegment(operation: UpdateDto.Operation, segment: UpdateDto.Segment): void
  updateSegmentDisabled(operation: UpdateDto.Operation, segmentDisabled: UpdateDto.SegmentDisabled): void,
  updateZcu(operation: UpdateDto.Operation, zcu: UpdateDto.Zcu): void
}

export { IOmsTrackMonitor }
