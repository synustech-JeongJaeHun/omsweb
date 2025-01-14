import {
	BufferHistoryEvent,
	CurrentBuffer,
	CurrentOrder,
	CurrentSegmentBlocking,
	CurrentStation,
	CurrentVehicle,
	CurrentZcu,
	OrderHistoryEvent,
	PlaybackBuffer,
	PlaybackMtl,
	PlaybackPoint,
	PlaybackSnapshotBuffer,
	PlaybackSnapshotOrder,
	PlaybackSnapshotSegmentBlocking,
	PlaybackSnapshotStation,
	PlaybackSnapshotVehicle,
	PlaybackSnapshotZcu,
	PlaybackStation,
	SegmentBlockingHistoryEvent,
	StationHistoryEvent,
	VehicleHistoryEvent,
	ZcuHistoryEvent,
} from '../../../models/playback.model'
import { getPortVehicleCommand, isConnected } from './playback-parse.util'

function convertTrackPointToTmPoint(point: PlaybackPoint) {
	return {
		...point,
		logicalId: point.logical_id,
		physicalId: point.physical_id,
	}
}

function convertTrackBufferToTmBuffer(buffer: PlaybackBuffer) {
	return {
		id: buffer.id,
		logicalId: buffer.logical_id,
		physicalId: buffer.physical_id,
		direction: buffer.direction,
		pointId: buffer.point,
		nextPoint: buffer.next_point,
		offset: buffer.offset,
    cAlias: buffer.c_alias,
    state: buffer.state,
    type: buffer?.type === 'Normal' ? null : buffer?.type,
    alertPassedTime: buffer.alert_passed_time,
	}
}

function convertTrackStationToTmStation(station: PlaybackStation) {
	return {
		...station,
		carrierId: station.carrier_id,
		carrierType: station.carrier_type,
		logicalId: station.logical_id,
		physicalId: station.physical_id,
		pointId: station.point,
		nextPoint: station.next_point,
    cAlias: station.c_alias,
    state: station.state
	}
}

function convertTrackMtlToTmMtl(mtl: PlaybackMtl) {
	return {
		id: mtl.id,
		pointId: mtl.point,
		logicalId: mtl.logical_id,
		physicalId: mtl.physical_id,
	}
}

function convertSnapshotVehicleToTmUpdateDtoVehicle(
	vehicle: PlaybackSnapshotVehicle,
	orders: CurrentOrder[],
) {
	const order = orders.find((o) => o.id === vehicle.order_id)

	return {
		id: vehicle.id,
		logicalId: vehicle.logical_id,
		physicalId: vehicle.physical_id,
		canBePushed: vehicle.can_be_pushed,
		cargoState: vehicle.cargo_state,
		curPoint: vehicle.last_point, // right?
		nextPoint: vehicle.next_point,
		errorList: vehicle.error_list,
		isBlocked: vehicle.is_blocked,
		isSensorStopped: vehicle.is_sensor_stopped,
		isMaint: vehicle.is_maint,
		lastContact: vehicle.last_contact,
		mapDb: vehicle.map_db,
		mode: vehicle.mode,
		movingState: vehicle.moving_state,
		distancePoint: vehicle.distance_point,
		hostOrder: undefined, // ?
		orderOrigin: vehicle.order_origin,
		cargoTransferResult: vehicle.cargo_transfer_result, // string

		isConnected: isConnected(vehicle.connection), // convert number to boolean  isConnected ??
		commandPoint: getPortVehicleCommand(vehicle.command),
		locationDropoff: order?.locationDropoff,
		locationPickup: order?.locationPickup,
    locationDropoffAlias: order?.locationDropoffAlias,
    locationPickupAlias: order?.locationPickupAlias,
		locationMove: order?.locationMove,
		user: vehicle.user,
		note: vehicle.note,

		orderId: vehicle.order_id,
		orderLogicalId: undefined,
		priority: undefined,

		type: vehicle.type,
		// id: "command",
		// id: "nonce",
		// id: "rail_in",
		// id: "runtime",
		// id: "distance",
		// id: "soon_arrive",
		// id: "runtime_total",
		// id: "distance_total",
		// id: "next_end_point",
		// id: "push_point_list",
		// id: "preassigned_order_id",
		// id: "blocked_segment_pairs",

		// added in chjs
		carrierId: vehicle.carrier_id,
		isZcuBlocked: vehicle.is_zcu_blocked,
		destPoint: vehicle.dest_point == null ? '' : String(vehicle.dest_point),
    railIn: vehicle.rail_in,
    fireSensor: vehicle.fire_sensor,
		pauseState: vehicle.pause_state,
	}
}

function convertSnapshotSegmentBlockingToTmUpdateDtoSegmentDisabled(
	operation: string,
	segmentBlocking: PlaybackSnapshotSegmentBlocking,
) {
	return {
		operation: operation,
		id: segmentBlocking.id,
		data: {
			id: segmentBlocking.id,
			segmentId: segmentBlocking.segment_id,
			disabledBy: segmentBlocking.disabled_by,
			disabledReason: segmentBlocking.reason,
			user: segmentBlocking.user,
			note: segmentBlocking.note,
		},
	}
}

function convertSnapshotBufferToTmBuffer(buffer: PlaybackSnapshotBuffer): CurrentBuffer {
	return {
		id: buffer.id,
		logicalId: buffer.logical_id,
		physicalId: buffer.physical_id,
		direction: buffer.direction,
		pointId: buffer.point,
		nextPoint: buffer.next_point,
		offset: buffer.offset,
		unuse: buffer.unuse,
		carrierId: buffer.carrier_id,
		user: buffer.user,
		note: buffer.note,
    cAlias: buffer.c_alias,
    state: buffer.state,
    type: buffer?.type === 'Normal' ? null : buffer?.type,
    alertPassedTime: buffer.alert_passed_time,
	}
}
function convertSnapshotStationToTmStation(station: PlaybackSnapshotStation) {
	return {
		id: station.id,
		logicalId: station.logical_id,
		physicalId: station.physical_id,

		direction: station.direction,
		pointId: station.point,
		nextPoint: station.next_point,
		offset: station.offset,

		unuse: station.unuse,

		carrierType: station.carrier_type,

		user: station.user,
		note: station.note,
    cAlias: station.c_alias,
    state: station.state,
    carrierId: station.carrier_id,
	}
}
function convertSnapshotZcuToTmZcu(zcu: PlaybackSnapshotZcu) {
	return {
		id: zcu.id,
		x: zcu.x,
		y: zcu.y,
		usingType: zcu.using_type,
		error: zcu.status === 5,
		zcuType: zcu.zcu_type,
	}
}

function convertVehicleHistoryEventToTmUpdateDtoVehicle(
	event: VehicleHistoryEvent,
	orders: CurrentOrder[],
) {
	const order = orders.find((o) => o.id === event?.orderId)

	return {
		id: event.historySourceId,

		canBePushed: event.canBePushed,
		cargoState: event.cargoState,
		curPoint: event.lastPoint,
		nextPoint: event.nextPoint,
		errorList: event.errorList,
		isBlocked: event.isBlocked,

		isSensorStopped: event.isSensorStopped,
		isMaint: event.isMaint,
		// isConnected: event.connection, <= nullable number
		lastContact: event.lastContact,
		mapDb: event.mapDb,
		mode: event.mode,
		movingState: event.movingState,

		distancePoint: event.distancePoint,
		hostOrder: event.hostOrder,
		orderOrigin: event.orderOrigin,

		orderId: event.orderId,
		// commandPoint: event.commandPoint, // not comes with prefix, just number

		isConnected: isConnected(event.connection), // convert number to boolean  isConnected ??
		commandPoint: getPortVehicleCommand(event.command),
		locationDropoff: order?.locationDropoff,
		locationPickup: order?.locationPickup,
		locationMove: order?.locationMove,
		user: event.user,
		note: event.note,
		// cargoTransferResult?: string
		// orderLogicalId?: string
		// priority?: any
		// type?: string
		// group?: number
		// historyChangeTime?: any

		// added in chjs
		carrierId: event.carrierId,
		isZcuBlocked: event.isZcuBlocked,
		destPoint: event.destPoint,
    fireSensor: event.fireSensor,
		pauseState: event.pauseState,
	}
}

function convertSegmentBlockingHistoryEventToTmUpdateDtoSegmentDisabled(
	event: SegmentBlockingHistoryEvent,
) {
	return {
		id: event.historySourceId,
		operation: event.historyChangeType,
		data:
			event.historyChangeType === 'INSERT'
				? {
						id: event.historySourceId,
						segmentId: event.segmentId,
						disabledBy: event.disabledBy,
						disabledReason: event.reason,
						user: event.user,
						note: event.note,
				  }
				: {
              id: event.historySourceId,
              segmentId: event.segmentId,
              disabledBy: event.disabledBy,
              disabledReason: event.reason,
              user: event.user,
              note: event.note,
          },
	}
}

function convertBufferHistoryEventToTmUpdateDtoBuffer(
	event: BufferHistoryEvent,
) {
	return {
		id: event.historySourceId,
		unuse: event.unuse,
		carrierId: event.carrierId,
		user: event.user,
		note: event.note,
    state: event.state,
		type: event?.type === 'Normal' ? null : event?.type
	}
}

function convertStationHistoryEventToTmUpdateDtoStation(
	event: StationHistoryEvent,
) {
	return {
		id: event.historySourceId,
		unuse: event.unuse,
		carrierId: event.carrierId,
		user: event.user,
		note: event.note,
    state: event.state
	}
}

function convertZcuHistoryEventToTmUpdateDtoZcu(event: ZcuHistoryEvent) {
	return {
		id: event.historySourceId,
		x: event.x,
		y: event.y,
		usingType: event.usingType,
		error: event.status === 5,
		zcuType: event.zcuType,
	}
}

function convertSnapshotVehicleToCurrentVehicle(
	vehicle: PlaybackSnapshotVehicle,
): CurrentVehicle {
	return {
		canBePushed: vehicle.can_be_pushed,
		cargoState: vehicle.cargo_state,
		distancePoint: vehicle.distance_point,
		distanceTotal: vehicle.distance_total,
		errorList: vehicle.error_list,
		id: vehicle.id,
		isBlocked: vehicle.is_blocked,
		isMaint: vehicle.is_maint,
		isSensorStopped: vehicle.is_sensor_stopped,
		lastContact: vehicle.last_contact,
		lastPoint: vehicle.last_point,
		logicalId: vehicle.logical_id,
		mapDb: vehicle.map_db,
		mode: vehicle.mode,
		movingState: vehicle.moving_state,
		nextPoint: vehicle.next_point,
		orderId: vehicle.order_id,
		orderOrigin: vehicle.order_origin,
		physicalId: vehicle.physical_id,
		railIn: vehicle.rail_in,
		runtimeTotal: vehicle.runtime_total,
		user: vehicle.user,
		note: vehicle.note,
    destPoint: vehicle.dest_point,
		command: vehicle.command,
		commandPoint: getPortVehicleCommand(vehicle.command),
		isConnected: isConnected(vehicle.connection),
    carrierId: vehicle.carrier_id,
    distance: vehicle.distance,
    runtime: vehicle.runtime,
    fireSensor: vehicle.fire_sensor,
		pauseState: vehicle.pause_state,
	}
}

function convertSnapshotSegmentBlockingToCurrentSegmentBlocking(
	sb: PlaybackSnapshotSegmentBlocking,
): CurrentSegmentBlocking {
	return {
		id: sb.id,
		segmentId: sb.segment_id,
		disabledBy: sb.disabled_by,
		reason: sb.reason,
		user: sb.user,
		note: sb.note,
	}
}
function convertSnapshotOrderToCurrentOrder(
	order: PlaybackSnapshotOrder,
): CurrentOrder {
	const state = (function () {
		if (order.time_failed) return 'FAILED'
		else if (order.time_aborted) return 'ABORTED'
		else if (order.time_completed) return 'COMPLETED'
		else if (order.time_unload_completed) return 'UNLOADED'
		else if (order.time_unload_started) return 'UNLOADING'
		else if (order.time_load_completed) return 'LOADED'
		else if (order.time_load_started) return 'LOADING'
		else if (order.time_vehicle_arrived) return 'ARRIVED'
		else if (order.time_assigned) return 'ASSIGNED'
		else if (order.time_assigned == null) return 'UNASSIGNED'
		else return ''
	})()

	return {
		assignmentDetails: order.assignment_details,
		assignmentType: order.assignment_type,
		carrierLabel: order.carrier_label,
		id: order.id,
		locationDropoff: order?.location_dropoff,
		locationPickup: order?.location_pickup,
    locationDropoffAlias: order?.location_dropoff_alias,
    locationPickupAlias: order?.location_pickup_alias,
		locationMove: order?.location_move,
		logicalId: order.logical_id,
		origin: order.origin,
		priority: order.priority,
		timeAssigned: order.time_assigned,
		timeCreated: order.time_created,
		timeAborted: order.time_aborted,
		timeFailed: order.time_failed,
		timeCompleted: order.time_completed,
		vehicleId: order.vehicle_id,
		state,
	}
}

function convertSnapshotBufferToCurrentBuffer(
	buffer: PlaybackSnapshotBuffer,
): CurrentBuffer {
	return {
		id: buffer.id,
		note: buffer.note,
		user: buffer.user,
		point: buffer.point,
		unuse: buffer.unuse,
		offset: buffer.offset,
		direction: buffer.direction,
		carrierId: buffer.carrier_id,
		logicalId: buffer.logical_id,
		nextPoint: buffer.next_point,
		physicalId: buffer.physical_id,
		unusedTime: buffer.unused_time,
    slideOffset: buffer.slide_offset,
    cAlias: buffer.c_alias,
    state: buffer.state,
    type: buffer?.type === 'Normal' ? null : buffer?.type,
    alertPassedTime: buffer.alert_passed_time,
	}
}
function convertSnapshotStationToCurrentStation(
	station: PlaybackSnapshotStation,
): CurrentStation {
	return {
		id: station.id,
		note: station.note,
		user: station.user,
		point: station.point,
		unuse: station.unuse,
		offset: station.offset,
		direction: station.direction,
		carrierId: station.carrier_id,
		logicalId: station.logical_id,
		nextPoint: station.next_point,
		physicalId: station.physical_id,
		unusedTime: station.unused_time, //(date)
		carrierType: station.carrier_type,
    slideOffset: station.slide_offset,
    cAlias: station.c_alias,
    state: station.state,
	}
}

function convertSnapshotZcuToCurrentZcu(zcu: PlaybackSnapshotZcu): CurrentZcu {
	return {
		id: zcu.id,
		x: zcu.x,
		y: zcu.y,
		status: zcu.status,
		zcuType: zcu.zcu_type,
		usingType: zcu.using_type,
		user: zcu.user,
		note: zcu.note,
	}
}

function convertVehicleHistoryEventToCurrentVehicle(
	event: VehicleHistoryEvent,
): CurrentVehicle {
	return {
		canBePushed: event.canBePushed,
		cargoState: event.cargoState,
		distancePoint: event.distancePoint,
		distanceTotal: event.distanceTotal,
		errorList: event.errorList,
		id: event.historySourceId,
		isBlocked: event.isBlocked,
		isMaint: event.isMaint,
		isSensorStopped: event.isSensorStopped,
		lastContact: event.lastContact,
		lastPoint: event.lastPoint,
		logicalId: event.logicalId,
		mapDb: event.mapDb,
		mode: event.mode,
		movingState: event.movingState,
		nextPoint: event.nextPoint,
		orderId: event.orderId,
		orderOrigin: event.orderOrigin,
		physicalId: event.physicalId,
		railIn: event.railIn,
		runtimeTotal: event.runtimeTotal,
		user: event.user,
		note: event.note,
    destPoint: event.destPoint,
		command: event.command,
		commandPoint: getPortVehicleCommand(event.command),
		isConnected: isConnected(event.connection),
    carrierId: event.carrierId,
    distance: event.distance,
    runtime: event.runtime,
    fireSensor: event.fireSensor,
		pauseState: event.pauseState,
	}
}

function convertSegmentBlockingHistoryEventToCurrentSegmentBlocking(
	event: SegmentBlockingHistoryEvent,
): CurrentSegmentBlocking {
	return {
		id: event.historySourceId,
		segmentId: event.segmentId,
		disabledBy: event.disabledBy,
		reason: event.reason,
		user: event.user,
		note: event.note,
	}
}

function convertOrderHistoryEventToCurrentOrder(
	event: OrderHistoryEvent,
): CurrentOrder {
	return {
		assignmentDetails: event.assignmentDetails,
		assignmentType: event.assignmentType,
		carrierLabel: event.carrierLabel,
		id: event.historySourceId,
		locationDropoff: event?.locationDropoff,
		locationPickup: event?.locationPickup,
    locationDropoffAlias: event?.locationDropoffAlias,
    locationPickupAlias: event?.locationPickupAlias,
		locationMove: event?.locationMove,
		logicalId: event.logicalId,
		origin: event.origin,
		priority: event.priority,
		timeAssigned: event.timeAssigned,
		timeCreated: event.timeCreated,
		timeAborted: event.timeAborted,
		timeFailed: event.timeFailed,
		timeCompleted: event.timeCompleted,
		vehicleId: parseInt(event.vehicleId),
		state: event.state ?? '',
	}
}

function convertBufferHistoryEventToCurrentBuffer(
	buffer: CurrentBuffer,
	event: BufferHistoryEvent,
): CurrentBuffer {
	return {
		id: event.historySourceId,
		note: event.note,
		user: event.user,
		unuse: event.unuse,
		carrierId: event.carrierId,
		logicalId: event.logicalId,
		physicalId: event.physicalId,
		unusedTime: event.unusedTime,
		point: buffer.point,
		offset: buffer.offset,
		direction: buffer.direction,
		nextPoint: buffer.nextPoint,
    state: buffer.state,
    type: buffer?.type === 'Normal' ? null : buffer?.type,
    alertPassedTime: event.alertPassedTime
	}
}

function convertStationHistoryEventToCurrentStation(
	station: CurrentStation,
	event: StationHistoryEvent,
): CurrentStation {
	return {
		id: event.historySourceId,
		note: event.note,
		user: event.user,
		unuse: event.unuse,
		carrierId: event.carrierId,
		logicalId: event.logicalId,
		physicalId: event.physicalId,
		unusedTime: event.unusedTime, //(date)
		point: station.point,
		offset: station.offset,
		direction: station.direction,
		carrierType: station.carrierType,
		nextPoint: station.nextPoint,
    state: station.state
	}
}

function convertZcuHistoryEventToCurrentZcu(
	event: ZcuHistoryEvent,
): CurrentZcu {
	return {
		id: event.historySourceId,
		x: event.x,
		y: event.y,
		status: event.status,
		zcuType: event.zcuType,
		usingType: event.usingType,
		user: event.user,
		note: event.note,
	}
}

export {
	// ===============================TM=======================================
	// For TM - Track
	convertTrackPointToTmPoint,
	convertTrackBufferToTmBuffer,
	convertTrackStationToTmStation,
	convertTrackMtlToTmMtl,
	// For TM - Snapshot
	convertSnapshotVehicleToTmUpdateDtoVehicle,
	convertSnapshotSegmentBlockingToTmUpdateDtoSegmentDisabled,
	convertSnapshotBufferToTmBuffer,
	convertSnapshotStationToTmStation,
	convertSnapshotZcuToTmZcu,
	// For TM - Events
	convertVehicleHistoryEventToTmUpdateDtoVehicle,
	convertSegmentBlockingHistoryEventToTmUpdateDtoSegmentDisabled,
	convertBufferHistoryEventToTmUpdateDtoBuffer,
	convertStationHistoryEventToTmUpdateDtoStation,
	convertZcuHistoryEventToTmUpdateDtoZcu,
	// =========================Current State=================================
	// For CurrentState from Snapshot
	convertSnapshotVehicleToCurrentVehicle,
	convertSnapshotSegmentBlockingToCurrentSegmentBlocking,
	convertSnapshotOrderToCurrentOrder,
	convertSnapshotBufferToCurrentBuffer,
	convertSnapshotStationToCurrentStation,
	convertSnapshotZcuToCurrentZcu,
	// For CurrentState from Events
	convertVehicleHistoryEventToCurrentVehicle,
	convertSegmentBlockingHistoryEventToCurrentSegmentBlocking,
	convertOrderHistoryEventToCurrentOrder,
	convertBufferHistoryEventToCurrentBuffer,
	convertStationHistoryEventToCurrentStation,
	convertZcuHistoryEventToCurrentZcu,
}
