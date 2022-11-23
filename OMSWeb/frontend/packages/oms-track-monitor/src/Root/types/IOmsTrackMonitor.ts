import { IGroup, ITrackData } from '../../legacies/models/track.model'
import { Mtl } from '../../TrackObjects/mtl/types/Mtl'
import { Point } from '../../TrackObjects/point/types/Point'
import { Segment } from '../../TrackObjects/segment/types/Segment'
import { Station } from '../../TrackObjects/station/types/Station'
import { Vehicle } from '../../TrackObjects/vehicle/types/Vehicle'
import { Buffer } from '../../TrackObjects/buffer/types/Buffer'
import { UpdateDto } from '../../types/Dto'
import { Zcu } from 'src/TrackObjects/zcu/types/Zcu'
import { Fireshutter } from 'src/TrackObjects/fireshutter/types/Fireshutter'
import { Cluster } from 'src/TrackObjects/cluster/types/Cluster'

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
	find(type: 'zcu', id: Zcu['id']): void
  find(type: "cluster", id: Cluster['id']): void
	find(type: 'fireshutter', id: Mtl['id']): void
	// focus
	focus(type: 'vehicle', id: Vehicle['id'], focusType?: "PRIMARY" | "CARRIER"): void
	focus(type: 'point', id: Point['id']): void
	focus(type: 'segment', id: Segment['id']): void
	focus(type: 'station', id: Station['id']): void
	focus(type: 'buffer', id: Buffer['id'], focusType?: "PRIMARY" | "CARRIER"): void
	focus(type: 'mtl', id: Mtl['id']): void
	focus(type: 'zcu', id: Zcu['id']): void
	focus(type: 'cluster', id: Cluster['id']): void
	focus(type: 'fireshutter', id: Fireshutter['id']): void
	dropFocus(focusType?:  "PRIMARY" | "CARRIER" ): void

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
	updateBuffer(
		operation: UpdateDto.Operation,
		buffer: UpdateDto.Buffer
	): void
	updateGroupObject(
		operation: UpdateDto.Operation,
		groupObject: UpdateDto.GroupObject,
		data?: IGroup[]
	): void
	updateHome(operation: UpdateDto.Operation, home: UpdateDto.Home): void
	updateFireshutter(
		operation: UpdateDto.Operation,
		fireshutter: UpdateDto.Fireshutter
	): void
	updateMtl(operation: UpdateDto.Operation, mtls: UpdateDto.Mtl[]): void
  updateClusterState(operation: UpdateDto.Operation, clusterState: UpdateDto.ClusterState): void
}

export { IOmsTrackMonitor }
