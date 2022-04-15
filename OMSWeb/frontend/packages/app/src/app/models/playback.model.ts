type PhysicalId = string | undefined | null
type LogicalId = string | undefined | null

type PlaybackTrack = {
	timestamp: Date
	data: PlaybackTrackData
}

type PlaybackTrackData = {
	buffers: PlaybackBuffer[]
	cluster_points: PlaybackClusterPoint[]
	clusters: PlaybackCluster[]
	mtls: PlaybackMtl[]
	points: PlaybackPoint[]
	segment_parts: PlaybackSegmentPart[]
	segments: PlaybackSegment[]
	stations: PlaybackStation[]
}

type PlaybackBuffer = {
	direction: string
	id: number
	logical_id: LogicalId
	next_point: number
	offset: number
	physical_id: PhysicalId
	point: number
	unuse: boolean
	carrier_id: null
	x: null
	y: null
}
type PlaybackClusterPoint = {
	id: number
	pointId: number
	clusterId: number
}
type PlaybackCluster = {
	id: number
	color: string
	logicalId: LogicalId
	maxVehicles: number
}
type PlaybackMtl = {
	id: number
	logical_id: LogicalId
	physical_id: PhysicalId
	point: number
}
type PlaybackPoint = {
	x: number
	y: number
	id: number
	logical_id: LogicalId
	physical_id: PhysicalId
}
type PlaybackSegmentPart = {
	id: number
	type: string
	location: string
	direction: string
	segment_id: number
}
type PlaybackSegment = {
	end_point: number
	id: number
	length: number
	logical_id: LogicalId
	physical_id: PhysicalId
	speed: number
	start_point: number
}
type PlaybackStation = {
	carrier_id: null
	carrier_type: null
	direction: string
	id: number
	logical_id: LogicalId
	next_point: number
	offset: number
	physical_id: PhysicalId
	point: number
	unuse: boolean
	x: null
	y: null
}

type PlaybackSnapshot = {
	timestamp: Date
	data: PlaybackSnapshotData
}

type PlaybackSnapshotData = {
	orders: {
		assignment_details: unknown
		assignment_type: unknown
		carrier_label: string
		clean_status: unknown
		distance_deliver: unknown
		distance_move: unknown
		distance_pickup: unknown
		id: number
		location_dropoff: string
		location_move: unknown
		location_pickup: string
		logical_id: LogicalId
		origin: string
		priority: unknown
		status_details: unknown
		time_aborted: string | null
		time_assigned: string | null
		time_completed: string | null
		time_created: string | null
		time_failed: string | null
		time_load_completed: string | null
		time_load_started: string | null
		time_modified: string | null
		time_unload_completed: string | null
		time_unload_started: string | null
		time_vehicle_arrived: string | null
		transfer_state: number
		vehicle_id: number
	}[]

	segment_blocking: {
		disabled_by: string
		id: number
		reason: string
		segment_id: number
	}[]

	vehicles: {
		blocked_segment_pairs: string
		can_be_pushed: boolean
		cargo_state: string
		cargo_transfer_result: null
		command: string
		command_point: number
		connection: number
		distance: number
		distance_point: number
		distance_total: number
		error_list: string
		id: number
		is_blocked: boolean
		is_maint: boolean
		is_sensor_stopped: boolean
		last_contact: string
		last_point: number
		logical_id: LogicalId
		map_db: string
		mode: string
		moving_state: string
		next_end_point: number
		next_point: number
		nonce: number
		order_id: number
		order_origin: string
		physical_id: PhysicalId
		preassigned_order_id: number
		push_point_list: string
		rail_in: boolean
		runtime: number
		runtime_total: number
		soon_arrive: boolean
		type: unknown
	}[]
}

type TimelineEvent = VehicleHistoryEvent | SegmentBlockingHistoryEvent

type Timeline = { eventId: number; eventTime: string; tableName: string }
type History = {
	historySourceId: number
	historyChangeTime: string
	historyChangeType: string
}

type VehicleHistoryEvent = { tableName: 'vehicle_history' } & Timeline &
	History & {
		canBePushed: boolean
		cargoState: string
		commandPoint: string
		distancePoint: number
		distanceTotal: number
		errorList: string
		eventId: number
		eventTime: string
		historyChangeTime: string
		historyChangeType: string
		historySourceId: number
		hostOrder: boolean
		id: number
		isBlocked: boolean
		isMaint: boolean
		isSensorStopped: boolean
		lastContact: string
		lastPoint: number
		logicalId: string
		mapDb: string
		mode: string
		movingState: string
		nextPoint: number
		orderId: number
		orderOrigin: string
		physicalId: string
		railIn: boolean
		runtimeTotal: number
	}
type OrderHistoryEvent = {
	id: number
	logicalId: string
	origin: string
	vehicleId: string
	state: string
	locationPickup: string
	locationDropoff: string
	locationMove: string
	priority: number
	assignmentDetails: string
	assignmentType: string
	carrierLabel: string
	timeCreated: string | null | undefined
	timeAssigned: string | null | undefined
	timeCompleted: string | null | undefined
	timeAborted: string | null | undefined
	timeFailed: string | null | undefined
	distancePickup: number | null | undefined
	distanceDropoff: number | null | undefined
	distanceMove: number | null | undefined
}
type SegmentBlockingHistoryEvent = {
	tableName: 'segment_blocking_history'
} & Timeline &
	History & {
		id: number
		segmentId: number
		disabledBy: string
		reason: string
	}

type PlaybackSpeed = 0.1 | 0.5 | 1 | 2 | 5 | 10
type ClockChangedEvent =
	| TrackChangedEvent
	| SnapshotChangedEvent
	| EventsChangedEvent
	| NextFrameEvent

/**
 * Event when need to change track, snapshot and empty events
 */
type TrackChangedEvent = {
	type: 'TrackChanged'
	track: PlaybackTrackData
	snapshot: PlaybackSnapshotData
}
/**
 * Event when need to change snapshot and empty events
 */
type SnapshotChangedEvent = {
	type: 'SnapshotChanged'
	snapshot: PlaybackSnapshotData
}
/**
 * Event when need to change events
 */
type EventsChangedEvent = {
	type: 'EventsChanged'
	events: TimelineEvent[]
}
/**
 * Event when need to accumulate events
 */
type NextFrameEvent = {
	type: 'NextFrameEvent'
	events: TimelineEvent[]
}

export {
	LogicalId,
	PhysicalId,
	PlaybackTrack,
	PlaybackTrackData,
	PlaybackSnapshot,
	PlaybackSnapshotData,
	VehicleHistoryEvent,
	OrderHistoryEvent,
	SegmentBlockingHistoryEvent,
	TimelineEvent,
	PlaybackSpeed,
	ClockChangedEvent,
}
