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
	state: PlaybackSnapshotState
	orders: PlaybackSnapshotOrder[]
	segment_blocking: PlaybackSnapshotSegmentBlocking[]
	vehicles: PlaybackSnapshotVehicle[]
	buffers: PlaybackSnapshotBuffer[]
	stations: PlaybackSnapshotStation[]
	zcus: PlaybackSnapshotZcu[]
}
type PlaybackSnapshotOrder = {
	assignment_details: string | null
	assignment_type: string | null
	carrier_label: string
	clean_status: unknown
	distance_deliver: unknown
	distance_move: unknown
	distance_pickup: unknown
	id: number
	location_dropoff: string | null | undefined
	location_move: string | null | undefined
	location_pickup: string | null | undefined
	logical_id: LogicalId
	origin: string
	priority: number | string | null
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
}
type PlaybackSnapshotSegmentBlocking = {
	disabled_by: string
	id: number
	reason: string
	segment_id: number
	user?: string
	note?: string
}
type PlaybackSnapshotVehicle = {
	blocked_segment_pairs: string
	can_be_pushed: boolean
	cargo_state: string
	cargo_transfer_result: null
	carrier_id?: string
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
	is_zcu_blocked: boolean
	last_contact: string
	last_point: number
	logical_id: LogicalId
	map_db: string
	mode: string
	moving_state: string
	next_end_point: number
	next_point: number
	dest_point?: number
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
	user?: string
	note?: string
}

type PlaybackSnapshotBuffer = {
	x: unknown
	y: unknown
	id: number
	note: string
	user: string
	point: number
	unuse: boolean
	offset: number
	direction: string
	carrier_id?: string
	logical_id: string
	next_point: number
	physical_id: string
	unused_time?: string //(date)
}

type PlaybackSnapshotStation = {
	x: unknown
	y: unknown
	id: number
	note: string
	user: string
	point: number
	unuse: boolean
	offset: number
	direction: string
	carrier_id?: string
	logical_id: string
	next_point: number
	physical_id: string
	unused_time?: string //(date)
	carrier_type?: number
}

type PlaybackSnapshotZcu = {
	x: number
	y: number
	id: number
	note: string
	user: string
	status: number
	zcu_type: number
	using_type: number
}

type PlaybackSnapshotState = {
	ai_mode: number
	pm_state: number
	tsc_state: number
	comm_state: number
	control_state: number
}

type HistoryEvent =
	| VehicleHistoryEvent
	| SegmentBlockingHistoryEvent
	| OrderHistoryEvent
	| BufferHistoryEvent
	| StationHistoryEvent
	| ZcuHistoryEvent
	| ModeStateHistoryEvent

interface ITableName {
	tableName: string
}

type History = {
	historySourceId: number
	historyChangeTime: string
	historyChangeType: string
}

type VehicleHistoryEvent = { tableName: 'vehicle_history' } & ITableName &
	History & {
		canBePushed: boolean
		cargoState: string
		carrierId: string | undefined
		command: string | null | undefined
		commandPoint: string
		distancePoint: number
		distanceTotal: number
		errorList: string
		eventId: number
		historyChangeTime: string
		historyChangeType: string
		historySourceId: number
		hostOrder: boolean
		id: number
		isBlocked: boolean
		isMaint: boolean
		isSensorStopped: boolean
		isZcuBlocked: boolean
		// isConnected: boolean
		connection: number
		lastContact: string
		lastPoint: number
		destPoint: string | null | undefined
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
		user?: string
		note?: string
	}

type SegmentBlockingHistoryEvent = {
	tableName: 'segment_blocking_history'
} & ITableName &
	History & {
		id: number
		segmentId: number
		disabledBy: string
		reason: string
		user?: string
		note?: string
	}

type OrderHistoryEvent = { tableName: 'order_history' } & ITableName &
	History & {
		assignmentDetails: string
		assignmentType: string
		carrierLabel: string
		id: number
		locationDropoff: string | null | undefined
		locationPickup: string | null | undefined
		locationMove: string | null | undefined
		logicalId: LogicalId
		origin: string
		priority: number
		timeAssigned: string
		timeCreated: string
		timeCompleted: string | undefined
		timeAborted: string | undefined
		timeFailed: string | undefined
		vehicleId: string // parse to int
		state: string | undefined
	}

type BufferHistoryEvent = { tableName: 'buffer_history' } & ITableName &
	History & {
		id: number
		physicalId: string
		logicalId: string
		unuse?: boolean
		carrierId: string
		user: string
		note: string
		unusedTime?: string
	}
type StationHistoryEvent = { tableName: 'station_history' } & ITableName &
	History & {
		id: number
		physicalId: string
		logicalId: string
		unuse: boolean
		carrierId: string
		user: string
		note: string
		unusedTime?: string
	}
type ZcuHistoryEvent = { tableName: 'zcu_history' } & ITableName &
	History & {
		x: number
		y: number
		id: number
		note: string
		user: string
		status: number
		zcuType: number
		usingType: number
	}
type ModeStateHistoryEvent = { tableName: 'mode_state_history' } & ITableName &
	History & {
		comm_state: number
		control_state: number
		tsc_state: number
		pm_state: number
		ai_mode: number
	}

type RemainedAlarm = {
	id: number
	time: string
	errorCode: number
	vehicleId: number
	timeResolved?: string
	current?: string
	level: number
	description?: string
	cause?: string
	action?: string
	annotation?: string
}

type AlarmChange = RemainedAlarm & {
	historyChangeTime: string
	historyChangeType: 'INSERT' | 'UPDATE'
}

type PlaybackSpeed = 0.1 | 0.5 | 1 | 2 | 5 | 10
type ClockChangedEvent =
	| SnapshotChangedEvent
	| EventsChangedEvent
	| NextFrameEvent

/**
 * Event when need to change snapshot and empty events
 */
type SnapshotChangedEvent = {
	type: 'SnapshotChanged'
	clock: Date
	snapshot: PlaybackSnapshotData
}
/**
 * Event when need to change events
 */
type EventsChangedEvent = {
	type: 'EventsChanged'
	clock: Date
	events: HistoryEvent[]
	alarms: AlarmChange[]
}
/**
 * Event when need to accumulate events
 */
type NextFrameEvent = {
	type: 'NextFrameEvent'
	clock: Date
	events: HistoryEvent[]
	alarms: AlarmChange[]
}

type CurrentVehicle = {
	canBePushed: boolean
	cargoState: string
	distancePoint: number
	distanceTotal: number
	errorList: string
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
	// new - with connection
	command: string
	commandPoint: string
	isConnected: boolean
	// new - with order
	locationDropoff?: string
	locationPickup?: string
	locationMove?: string
	user?: string
	note?: string
}
type CurrentSegmentBlocking = {
	id: number
	segmentId: number
	disabledBy: string
	reason: string
	user?: string
	note?: string
}
type CurrentOrder = {
	assignmentDetails: string | null
	assignmentType: string | null
	carrierLabel: string | null
	id: number
	locationDropoff: string | null | undefined
	locationPickup: string | null | undefined
	locationMove: string | null | undefined
	logicalId: LogicalId
	origin: string
	priority: string | number
	timeAssigned: string
	timeCreated: string
	timeCompleted?: string
	timeAborted?: string
	timeFailed?: string
	vehicleId: number // parse to int
	state: string
}

type CurrentBuffer = {
	id: number
	note: string
	user: string
	point: number
	unuse: boolean
	offset: number
	direction: string
	carrierId?: string
	logicalId: string
	nextPoint: number
	physicalId: string
	unusedTime?: string
}
type CurrentStation = {
	id: number
	note: string
	user: string
	point: number
	unuse: boolean
	offset: number
	direction: string
	carrierId?: string
	logicalId: string
	nextPoint: number
	physicalId: string
	unusedTime?: string //(date)
	carrierType?: number
}

export {
	LogicalId,
	PhysicalId,
	PlaybackTrack,
	PlaybackTrackData,
	PlaybackPoint,
	PlaybackBuffer,
	PlaybackStation,
	PlaybackMtl,
	PlaybackSnapshot,
	PlaybackSnapshotData,
	PlaybackSnapshotState,
	PlaybackSnapshotVehicle,
	PlaybackSnapshotSegmentBlocking,
	PlaybackSnapshotOrder,
	PlaybackSnapshotBuffer,
	PlaybackSnapshotStation,
	VehicleHistoryEvent,
	OrderHistoryEvent,
	SegmentBlockingHistoryEvent,
	BufferHistoryEvent,
	StationHistoryEvent,
	HistoryEvent,
	RemainedAlarm,
	AlarmChange,
	PlaybackSpeed,
	ClockChangedEvent,
	CurrentVehicle,
	CurrentSegmentBlocking,
	CurrentOrder,
	CurrentBuffer,
	CurrentStation,
}
