import { ITrackData } from '../../legacies/models/track.model'
import { Mtl } from '../../TrackObjects/mtl/types/Mtl'
import { Point } from '../../TrackObjects/point/types/Point'
import { Segment } from '../../TrackObjects/segment/types/Segment'
import { Station } from '../../TrackObjects/station/types/Station'
import { Vehicle } from '../../TrackObjects/vehicle/types/Vehicle'
import { Buffer } from '../../TrackObjects/buffer/types/Buffer'
import { UpdateDto } from '../../types/Dto'
import { Zcu } from 'src/TrackObjects/zcu/types/Zcu'

// also update /export-types
interface IOmsTrackMonitor {
	// Get Data
	getCameraAndRotation(): {
		position: { x: number; y: number }
		viewBox: { width: number; height: number }
		rotation: number
	}
	setCameraAndRotation(objective: {
		position?: { x: number; y: number }
		viewBoxWidth?: number
		rotation?: number
	}): void
	// Set Data
	setTrack(track: ITrackData): void
	centerZoom(): void

	// find
	find(type: 'vehicle', id: Vehicle['id']): void
	find(type: 'point', id: Point['id']): void
	find(type: 'segment', id: Segment['id']): void
	find(type: 'station', id: Station['id']): void
	find(type: 'buffer', id: Buffer['id']): void
	find(type: 'mtl', id: Mtl['id']): void

	// focus
	focus(type: 'vehicle', id: Vehicle['id']): void
	focus(type: 'point', id: Point['id']): void
	focus(type: 'segment', id: Segment['id']): void
	focus(type: 'station', id: Station['id']): void
	focus(type: 'buffer', id: Buffer['id']): void
	focus(type: 'mtl', id: Mtl['id']): void
	focus(type: 'zcu', id: Zcu['id']): void
	dropFocus(): void

	track(type: 'vehicle', id: Vehicle['id']): void
	stopTrack(): void

	// Update Data
	updateVehicle(
		operation: UpdateDto.Operation,
		vehicle: UpdateDto.Vehicle
	): void
	// updateSegment(operation: UpdateDto.Operation, segment: UpdateDto.Segment): void
	updateSegmentDisabled(
		operation: UpdateDto.Operation,
		segmentDisabled: UpdateDto.SegmentDisabled
	): void
	updateZcu(operation: UpdateDto.Operation, zcu: UpdateDto.Zcu): void
	updateStation(
		operation: UpdateDto.Operation,
		station: UpdateDto.Station
	): void
}

export { IOmsTrackMonitor }
