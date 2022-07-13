import { UpdateDto } from 'src/types/Dto'

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
	setTrack(track: any): void
	centerZoom(): void

	// find
	find(type: string, id: number): void

	// focus
	focus(type: string, id: number): void
	dropFocus(): void

	// track
	track(type: string, id: number): void
	stopTrack(): void

	// Update Data
	updateVehicle(operation: string, vehicle: any): void
	// updateSegment(operation: UpdateDto.Operation, segment: UpdateDto.Segment): void
	updateSegmentDisabled(operation: string, segmentDisabled: any): void
	updateZcu(operation: string, zcu: any): void
	updateStation(operation: string, station: any): void
	updateBuffer(operation: string, buffer: any): void
	updateGroupObject(
		operation: UpdateDto.Operation,
		groupObject: any,
		data?: any[]
	): void
	updateHome(operation: UpdateDto.Operation, home: any): void
	updateFireshutter(operation: UpdateDto.Operation, fireshutter: any): void
	updateMtl(operation: UpdateDto.Operation, mtls: any): void
}

export { IOmsTrackMonitor }
