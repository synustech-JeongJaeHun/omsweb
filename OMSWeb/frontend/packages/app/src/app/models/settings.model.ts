import {ToggleOptionKeyType, VHLIdPosition} from './enums'
import { StorageUtil } from '@oms/utils/storage.util'
import { main_css } from '../modules/shared/utils/css-loader'
import { IZoom } from './drawing.model'

export type ToggleOptionsType = {
	[key in ToggleOptionKeyType]: boolean
}

export class ServiceConfig {
	sid: string
	allowPublicMonitor = false
	version: string
	kpiEnabled: boolean
	bufferEnabled: boolean
	i18nEnabled: boolean

  onOffLine: boolean
  zcuDetail: boolean

  titleText: string
}

export interface ManualTransferFiltersSetting {
	sourceFilterEnabled: boolean
	sourceWords: string[]
	destinationFilterEnabled: boolean
	destinationWords: string[]
}
export interface NodeMarginSetting {
	stationMargin?: number
	bufferMargin?: number
}

export class MapConfig {
	vehicleScale?: number = main_css.vehicle.radius
	mapRotation?: number = 0
	segmentWidth?: number = 2
	segmentDirectionSize? = 5
}

export class ThemeConfig {
	// playbackBackground?: any;
	[key: string]: any
}

export interface IPreferences {
	toggles: ToggleOptionsType
	map: MapConfig
	uiStates?: UiStates
	theme?: ThemeConfig
	controlTables?: MonitorControlTable
	historyTables?: HistoryTable

  trackDisplay?: TrackObjectConfig
}

export class UiStates {
	controlTab?: number = 0
	zoom?: IZoom
}

export const defaultToggleOptions: ToggleOptionsType = {
	minimap: true,
	controlTable: false,
	expectedPaths: false,
	vehicleLines: false,
	pointLabels: false,
	segmentDirections: true,
	stations: true,
	buffers: false,
	groups: true,
	zcus: true,
	mtls: true,
	vehicles: true,
	clusters: true,
	overlaps: false,
	itemDetails: false,
	showToolName: false,
	showOmsVersion: true,
	showKpi: true,
  zoomButton: false,
  pointDisplayType: false,
  ctrlKey: true
}

type MonitorControlTable = typeof defaultControlTable
const defaultControlTable = {
	// order table
	orders: true,

	orders_id: true,
	orders_origin: true,
	orders_logicalId: true,
	orders_priority: true,
	orders_state: true,
	orders_vehicleId: true,
	orders_locationPickup: true,
	orders_locationDropoff: true,
	orders_locationMove: true,
	orders_carrierLabel: true,
	orders_timeCreated: true,
	orders_timeAssigned: true,
	orders_lastReassignType: true,
	orders_durationTotal: false,
	orders_durationUnassigned: false,
	orders_durationPickup: false,
	orders_durationLoad: false,
	orders_durationDropoff: false,
	orders_durationUnload: false,
	orders_durationMove: false,
	orders_distancePickup: false,
	orders_distanceDropoff: false,
	orders_distanceMove: false,

	orders_order: [
		{ name: 'orders_id', i18nLabel: 'names.id', width: 50 },
		{ name: 'orders_origin', i18nLabel: 'names.origin', width: 70 },
		{ name: 'orders_logicalId', i18nLabel: 'names.logicalId', width: 240 },
		{ name: 'orders_priority', i18nLabel: 'names.priority', width: 70 },
		{ name: 'orders_state', i18nLabel: 'names.state', width: 100 },
		{ name: 'orders_vehicleId', i18nLabel: 'names.vehicleId', width: 110 },
		{
			name: 'orders_locationPickup',
			i18nLabel: 'names.locationPickup',
			width: 140,
		},
		{
			name: 'orders_locationDropoff',
			i18nLabel: 'names.locationDropoff',
			width: 140,
		},
		{
			name: 'orders_locationMove',
			i18nLabel: 'names.locationMove',
			width: 140,
		},
		{
			name: 'orders_carrierLabel',
			i18nLabel: 'names.carrierLabel',
			width: 100,
		},
		{ name: 'orders_timeCreated', i18nLabel: 'names.timeCreated', width: 110 },
		{
			name: 'orders_timeAssigned',
			i18nLabel: 'names.timeAssigned',
			width: 110,
		},
		{
			name: 'orders_lastReassignType',
			i18nLabel: 'names.lastReassignType',
			width: 80,
		},
		{
			name: 'orders_durationTotal',
			i18nLabel: 'names.durationTotal',
			width: 80,
		},
		{
			name: 'orders_durationUnassigned',
			i18nLabel: 'names.durationUnassigned',
			width: 80,
		},
		{
			name: 'orders_durationPickup',
			i18nLabel: 'names.durationPickup',
			width: 80,
		},
		{ name: 'orders_durationLoad', i18nLabel: 'names.durationLoad', width: 80 },
		{
			name: 'orders_durationDropoff',
			i18nLabel: 'names.durationDropoff',
			width: 80,
		},
		{
			name: 'orders_durationUnload',
			i18nLabel: 'names.durationUnload',
			width: 80,
		},
		{ name: 'orders_durationMove', i18nLabel: 'names.durationMove', width: 80 },
		{
			name: 'orders_distancePickup',
			i18nLabel: 'names.distancePickup',
			width: 80,
		},
		{
			name: 'orders_distanceDropoff',
			i18nLabel: 'names.distanceDropoff',
			width: 80,
		},
		{ name: 'orders_distanceMove', i18nLabel: 'names.distanceMove', width: 'auto' },
	],

	// vehicle table
	vehicles: true,

	vehicles_id: true,
	vehicles_logicalId: true,
	vehicles_connection: true,
	vehicles_railIn: true,
	vehicles_mode: true,
	vehicles_isMaint: true,
	vehicles_canBePushed: true,
	vehicles_hostOrder: true,
	vehicles_orderOrigin: true,
	vehicles_group: true,
	vehicles_curPoint: true,
	vehicles_commandPoint: false,
	vehicles_destPoint: false,
	vehicles_orderId: true,
	vehicles_locationPickup: true,
	vehicles_locationDropoff: true,
	vehicles_locationMove: true,
	vehicles_runtimeTotal: true,
	vehicles_movingState: true,
	vehicles_cargoState: true,
	vehicles_carrierLabel: true,
	vehicles_error: true,
	vehicles_sensorStopped: true,
	vehicles_blocked: true,
	vehicles_distanceTotal: true,
	vehicles_mapDb: true,
	vehicles_mapVersion: true,
	vehicles_user: true,
	vehicles_note: true,

	vehicles_order: [
		{ name: 'vehicles_id', i18nLabel: 'names.id', width: 60 },
		{ name: 'vehicles_logicalId', i18nLabel: 'names.logicalId', width: 90 },
		{ name: 'vehicles_connection', i18nLabel: 'names.connected', width: 60 },
		{ name: 'vehicles_railIn', i18nLabel: 'names.railIn', width: 60 },
		{ name: 'vehicles_mode', i18nLabel: 'names.mode', width: 60 },
		{ name: 'vehicles_isMaint', i18nLabel: 'names.maintenance', width: 80 },
		{ name: 'vehicles_canBePushed', i18nLabel: 'names.canBePushed', width: 60 },
		{ name: 'vehicles_hostOrder', i18nLabel: 'names.hostCommand', width: 90 },
		{ name: 'vehicles_orderOrigin', i18nLabel: 'names.orderOrigin', width: 60 },
		{ name: 'vehicles_group', i18nLabel: 'names.group', width: 60 },
		{ name: 'vehicles_curPoint', i18nLabel: 'names.curPoint', width: 60 },
		{
			name: 'vehicles_commandPoint',
			i18nLabel: 'names.commandPoint',
			width: 60,
		},
		{ name: 'vehicles_destPoint', i18nLabel: 'names.destPoint', width: 60 },
		{ name: 'vehicles_orderId', i18nLabel: 'names.orderId', width: 60 },
		{
			name: 'vehicles_locationPickup',
			i18nLabel: 'names.locationPickup',
			width: 140,
		},
		{
			name: 'vehicles_locationDropoff',
			i18nLabel: 'names.locationDropoff',
			width: 140,
		},
		{
			name: 'vehicles_locationMove',
			i18nLabel: 'names.locationMove',
			width: 140,
		},
		{
			name: 'vehicles_runtimeTotal',
			i18nLabel: 'names.runtimeTotal',
			width: 80,
		},
		{ name: 'vehicles_movingState', i18nLabel: 'names.movingState', width: 80 },
		{ name: 'vehicles_cargoState', i18nLabel: 'names.cargoState', width: 80 },
		{
			name: 'vehicles_carrierLabel',
			i18nLabel: 'names.carrierLabel',
			width: 110,
		},
		{ name: 'vehicles_error', i18nLabel: 'names.errorList', width: 70 },
		{
			name: 'vehicles_sensorStopped',
			i18nLabel: 'names.sensorStopped',
			width: 80,
		},
		{ name: 'vehicles_blocked', i18nLabel: 'names.blocked', width: 80 },
		{
			name: 'vehicles_distanceTotal',
			i18nLabel: 'names.distanceTotal',
			width: 80,
		},
		{ name: 'vehicles_mapDb', i18nLabel: 'names.mapDb', width: 90 },
		{ name: 'vehicles_mapVersion', i18nLabel: 'names.mapVersion', width: 90 },
		{ name: 'vehicles_user', i18nLabel: 'names.user', width: 80 },
		{ name: 'vehicles_note', i18nLabel: 'names.note', width: 'auto' },
	],

	// stations table
	stations: true,

	stations_id: true,
	stations_physicalId: true,
	stations_logicalId: true,
	stations_group: true,
	stations_point: true,
	stations_direction: true,
	stations_nextPoint: true,
	stations_offset: true,
	stations_unuse: true,
	stations_carrierId: true,
    stations_slideOffset: false,
	stations_user: true,
	stations_note: true,

	stations_order: [
		{ name: 'stations_id', i18nLabel: 'names.id', width: 50 },
		{ name: 'stations_physicalId', i18nLabel: 'names.physicalId', width: 120 },
		{ name: 'stations_logicalId', i18nLabel: 'names.logicalId', width: 120 },
		{ name: 'stations_group', i18nLabel: 'names.group', width: 60 },
		{ name: 'stations_point', i18nLabel: 'names.point', width: 100 },
		{ name: 'stations_direction', i18nLabel: 'names.direction', width: 100 },
		{ name: 'stations_nextPoint', i18nLabel: 'names.nextPoint', width: 100 },
		{ name: 'stations_offset', i18nLabel: 'names.offset', width: 100 },
		{ name: 'stations_unuse', i18nLabel: 'names.unuse', width: 100 },
		{ name: 'stations_carrierId', i18nLabel: 'names.carrierId', width: 100 },
        { name: 'stations_slideOffset', i18nLabel: 'names.slideOffset', width: 100 },
		{ name: 'stations_user', i18nLabel: 'names.user', width: 80 },
		{ name: 'stations_note', i18nLabel: 'names.note', width: 'auto' },
	],

	// buffers table
	buffers: true,

	buffers_id: true,
	buffers_physicalId: true,
	buffers_logicalId: true,
	buffers_group: true,
	buffers_point: true,
	buffers_direction: true,
	buffers_nextPoint: true,
	buffers_offset: true,
	buffers_unuse: true,
	buffers_carrierId: true,
    buffers_slideOffset: false,
	buffers_user: true,
	buffers_note: true,

	buffers_order: [
		{ name: 'buffers_id', i18nLabel: 'names.id', width: 50 },
		{ name: 'buffers_physicalId', i18nLabel: 'names.physicalId', width: 120 },
		{ name: 'buffers_logicalId', i18nLabel: 'names.logicalId', width: 120 },
		{ name: 'buffers_group', i18nLabel: 'names.group', width: 60 },
		{ name: 'buffers_point', i18nLabel: 'names.point', width: 100 },
		{ name: 'buffers_direction', i18nLabel: 'names.direction', width: 100 },
		{ name: 'buffers_nextPoint', i18nLabel: 'names.nextPoint', width: 100 },
		{ name: 'buffers_offset', i18nLabel: 'names.offset', width: 100 },
		{ name: 'buffers_unuse', i18nLabel: 'names.unuse', width: 100 },
		{ name: 'buffers_carrierId', i18nLabel: 'names.carrierId', width: 100 },
        { name: 'buffers_slideOffset', i18nLabel: 'names.slideOffset', width: 100 },
		{ name: 'buffers_user', i18nLabel: 'names.user', width: 80 },
		{ name: 'buffers_note', i18nLabel: 'names.note', width: 'auto' },
	],

	// zcus table
	zcus: true,

	zcus_id: true,
	zcus_using_type: true,
	zcus_type: true,
	zcus_status: true,
  zcus_logicalId: false,
  zcus_passVehicle: false,
  zcus_vehicleCount: false,
  zcus_vehicleInfo: false,
	zcus_errorCode: true,

	zcus_order: [
		{ name: 'zcus_id', i18nLabel: 'names.id', width: 50 },
		{ name: 'zcus_using_type', i18nLabel: 'names.usingType', width: 100 },
		{ name: 'zcus_type', i18nLabel: 'names.zcuType', width: 100 },
		{ name: 'zcus_status', i18nLabel: 'names.status', width: 100 },
    { name: 'zcus_logicalId', i18nLabel: 'names.logicalId', width: 120 },
    { name: 'zcus_passVehicle', i18nLabel: 'names.passVehicle', width: 100 },
    { name: 'zcus_vehicleCount', i18nLabel: 'names.vehicleCount', width: 100 },
    { name: 'zcus_vehicleInfo', i18nLabel: 'names.vehicleInfo', width: 100 },
		{ name: 'zcus_errorCode', i18nLabel: 'names.errorCode', width: 'auto' }
	],

	// cps table
	cps: true,

	cps_logical_id: true,
	cps_converter_id: true,
	cps_status: true,
	cps_voltage: true,
	cps_current_igbt: true,
	cps_current_track: true,
	cps_frequency: true,
	cps_temp_radiator: true,
	cps_temp_internal: true,
	cps_sync: true,
	cps_backup_id: true,
	cps_error_code: true,

	cps_order: [
		{
			name: 'cps_converter_id',
			i18nLabel: 'names.cps_converter_id',
			width: 70,
		},
		{ name: 'cps_logical_id', i18nLabel: 'names.logicalId', width: 120 },
		{ name: 'cps_status', i18nLabel: 'names.cps_status', width: 120 },
		{ name: 'cps_voltage', i18nLabel: 'names.cps_voltage', width: 60 },
		{
			name: 'cps_current_igbt',
			i18nLabel: 'names.cps_current_igbt',
			width: 60,
		},
		{
			name: 'cps_current_track',
			i18nLabel: 'names.cps_current_track',
			width: 60,
		},
		{ name: 'cps_frequency', i18nLabel: 'names.cps_frequency', width: 70 },
		{
			name: 'cps_temp_radiator',
			i18nLabel: 'names.cps_temp_radiator',
			width: 80,
		},
		{
			name: 'cps_temp_internal',
			i18nLabel: 'names.cps_temp_internal',
			width: 80,
		},
		{ name: 'cps_sync', i18nLabel: 'names.cps_sync', width: 60 },
		{ name: 'cps_backup_id', i18nLabel: 'names.cps_backup_id', width: 60 },
		{ name: 'cps_error_code', i18nLabel: 'names.cps_error_code', width: 'auto' },
	],
}

type HistoryTable = typeof defaultHistoryTable
const defaultHistoryTable = {
	// transfers table
	transfers: true,

	transfers_logical_id: true,
	transfers_id: true,
	transfers_origin: true,
	transfers_priority: true,
	transfers_state: true,
	transfers_vehicle_id: true,
	transfers_location_pickup: true,
	transfers_location_dropoff: true,
	transfers_location_move: true,
	transfers_carrier_label: true,
	transfers_time_created: true,
	transfers_time_assigned: true,
	transfers_time_completed: true,
	transfers_time_aborted: true,
	transfers_time_failed: true,
    transfers_result_code: true,
	transfers_age: true,
	transfers_unload_retry_cnt: true,

	transfers_order: [
		{ name: 'transfers_logical_id', i18nLabel: 'names.commandId', width: 240 },
		{ name: 'transfers_id', i18nLabel: 'names.id', width: 80 },
		{ name: 'transfers_origin', i18nLabel: 'names.origin', width: 100 },
		{ name: 'transfers_priority', i18nLabel: 'names.priority', width: 65 },
		{ name: 'transfers_state', i18nLabel: 'names.state', width: 100 },
		{ name: 'transfers_vehicle_id', i18nLabel: 'names.vehicleId', width: 95 },
		{
			name: 'transfers_location_pickup',
			i18nLabel: 'names.locationPickup',
			width: 120,
		},
		{
			name: 'transfers_location_dropoff',
			i18nLabel: 'names.locationDropoff',
			width: 120,
		},
		{
			name: 'transfers_location_move',
			i18nLabel: 'names.locationMove',
			width: 120,
		},
		{
			name: 'transfers_carrier_label',
			i18nLabel: 'names.carrierLabel',
			width: 70,
		},
		{
			name: 'transfers_time_created',
			i18nLabel: 'names.timeCreated',
			width: 120,
		},
		{
			name: 'transfers_time_assigned',
			i18nLabel: 'names.timeAssigned',
			width: 120,
		},
		{
			name: 'transfers_time_completed',
			i18nLabel: 'names.timeCompleted',
			width: 120,
		},
		{
			name: 'transfers_time_aborted',
			i18nLabel: 'names.timeAborted',
			width: 120,
		},
		{
			name: 'transfers_time_failed',
			i18nLabel: 'names.timeFailed',
			width: 120,
        },
        {
          name: 'transfers_result_code',
          i18nLabel: 'names.reason',
          width: 120,
        },
        { name: 'transfers_age', i18nLabel: 'names.elapsed', width: 120 },
		{
			name: 'transfers_unload_retry_cnt',
			i18nLabel: 'names.unloadRetryCount',
			width: 120,
		},
	],

	// vehicles table
	vehicles: true,

	vehicles_physical_id: true,
	vehicles_logical_id: true,
	vehicles_distance_total: true,
	vehicles_runtime_total: true,
	vehicles_empty: true,

	vehicles_order: [
		{ name: 'vehicles_physical_id', i18nLabel: 'names.id', width: 120 },
		{ name: 'vehicles_logical_id', i18nLabel: 'names.logicalId', width: 120 },
		{
			name: 'vehicles_distance_total',
			i18nLabel: 'names.distanceTotal',
			width: 180,
		},
		{
			name: 'vehicles_runtime_total',
			i18nLabel: 'names.runtimeTotal',
			width: 180,
		},
		{ name: 'vehicles_empty', i18nLabel: '', width: 120 },
	],

	// alarms table
	alarms: true,

	alarms_vehicle_logical_id: true,
	alarms_description: true,
	alarms_level: true,
	alarms_error_code: true,
	alarms_cause: true,
	alarms_cleared: true,
	alarms_time: true,
	alarms_time_resolved: true,
	alarms_age: true,
	alarms_current: true,

	alarms_order: [
		{
			name: 'alarms_vehicle_logical_id',
			i18nLabel: 'names.vehicle',
			width: 160,
		},
		{ name: 'alarms_description', i18nLabel: 'names.alarmName', width: 320 },
		{ name: 'alarms_level', i18nLabel: 'names.level', width: 120 },
		{ name: 'alarms_error_code', i18nLabel: 'names.errorCode', width: 120 },
		{ name: 'alarms_cause', i18nLabel: 'names.cause', width: 320 },
		{ name: 'alarms_cleared', i18nLabel: 'names.cleared', width: 100 },
		{ name: 'alarms_time', i18nLabel: 'names.time', width: 120 },
		{
			name: 'alarms_time_resolved',
			i18nLabel: 'names.timeResolved',
			width: 120,
		},
        { name: 'alarms_age', i18nLabel: 'names.elapsed', width: 120 },
		{ name: 'alarms_current', i18nLabel: 'names.current', width: 120 },
    { name: 'physical_id', i18nLabel: 'names.physicalId', width: 'auto' },
	],

	// nack_column
    nacks_stream_function: true,
    nacks_rcmd: true,
	nacks_command_id: true,
	nacks_time: true,
	nacks_origin: true,
	nacks_source: true,
	nacks_dest: true,
	nacks_carrier_id: true,
	nacks_carrier_loc: true,
	nacks_code: true,
	nacks_reason: true,
	nacks_param: true,

    nacks_order: [
        { name: 'nacks_stream_function', i18nLabel: 'names.streamFunction', width: 120 },
        { name: 'nacks_rcmd', i18nLabel: 'names.rcmd', width: 120 },
		{ name: 'nacks_command_id', i18nLabel: 'names.commandId', width: 240 },
		{ name: 'nacks_time', i18nLabel: 'names.time', width: 120 },
		{ name: 'nacks_origin', i18nLabel: 'names.origin', width: 100 },
		{ name: 'nacks_source', i18nLabel: 'names.source', width: 120 },
		{ name: 'nacks_dest', i18nLabel: 'names.dest', width: 120 },
		{ name: 'nacks_carrier_id', i18nLabel: 'names.carrierId', width: 240 },
		{ name: 'nacks_carrier_loc', i18nLabel: 'names.carrierLoc', width: 120 },
		{ name: 'nacks_code', i18nLabel: 'names.nackCode', width: 100 },
		{ name: 'nacks_reason', i18nLabel: 'names.nackReason', width: 120 },
		{ name: 'nacks_param', i18nLabel: 'names.nackParam', width: 180 },
	],
}


type TrackObjectConfig = typeof trackObjectDefaultConfig
const trackObjectDefaultConfig ={
  vehicleIdDisplay: 'LeftTop'
}

export class ClientPreferences implements IPreferences {
	toggles: ToggleOptionsType
	map: MapConfig
	uiStates?: UiStates
	theme?: ThemeConfig
	controlTables?: MonitorControlTable
	historyTables?: HistoryTable

  trackDisplay?: TrackObjectConfig

	constructor(private storeKey: string, private base?: IPreferences) {
		this.load()
	}

	getServiceConfig() {}

	private load() {
		const value = StorageUtil.getLocal(this.storeKey) || '{}'
		const {
			toggles = {},
			map = {},
			uiStates = {},
			theme = {},
			controlTables = {},
			historyTables = {},
      trackDisplay ={},
		} = JSON.parse(value)
		const {
			toggles: baseToggle = {},
			map: baseMap = {},
			controlTables: baseControlTable = {},
			historyTables: baseHistoryTable = {},
      trackDisplay: baseDisplay = {}
		} = this.base || {}
		this.toggles = { ...defaultToggleOptions, ...baseToggle, ...toggles }
		this.map = { ...new MapConfig(), ...baseMap, ...map }
		this.uiStates = { ...new UiStates(), ...uiStates }
		this.theme = { ...new ThemeConfig(), ...theme }
		this.controlTables = {
			...defaultControlTable,
			...baseControlTable,
			...controlTables,
		}
		this.historyTables = {
			...defaultHistoryTable,
			...baseHistoryTable,
			...historyTables,
		}
    this.trackDisplay = {
      ...trackObjectDefaultConfig,
      ...trackDisplay
    }

		this.mergeOrders()
		this.save()
	}

	save() {
		const pref: IPreferences = {
			toggles: { ...this.toggles },
			map: { ...this.map },
			uiStates: { ...this.uiStates },
			theme: { ...this.theme },
			controlTables: { ...this.controlTables },
			historyTables: { ...this.historyTables },
      trackDisplay: {...this.trackDisplay}
		}
		StorageUtil.setLocal(this.storeKey, JSON.stringify(pref))
	}

	/**
	 * ## merge orders 1. local 2. default(new values)
	 *
	 * ### monitor orders
	 *
	 * - orders_order
	 * - vehicles_order
	 * - stations_order
	 * - buffers_order
	 * - zcus_order
	 * - cps_order
	 *
	 * ### history orders
	 *
	 * - transfers_order
	 * - vehicles_order
	 * - alarms_order
	 *
	 */
	private mergeOrders() {
		;[
			// monitor tables
			[defaultControlTable.orders_order, this.controlTables.orders_order],
			[defaultControlTable.vehicles_order, this.controlTables.vehicles_order],
			[defaultControlTable.stations_order, this.controlTables.stations_order],
			[defaultControlTable.buffers_order, this.controlTables.buffers_order],
			[defaultControlTable.zcus_order, this.controlTables.zcus_order],
			[defaultControlTable.cps_order, this.controlTables.cps_order],

			// history tables
			[defaultHistoryTable.transfers_order, this.historyTables.transfers_order],
			[defaultHistoryTable.vehicles_order, this.historyTables.vehicles_order],
			[defaultHistoryTable.alarms_order, this.historyTables.alarms_order],
			[defaultHistoryTable.nacks_order, this.historyTables.nacks_order],
		].forEach(([defaultOrder, currentOrder]) => {
			defaultOrder
				.filter((di) => currentOrder.every((ci) => ci.name !== di.name))
				.forEach((di) => currentOrder.push(di))
		})
	}
}

export interface ISettingsSegment {
	id: number
	physicalId: string
	logicalId: string
	startPoint: number
	endPoint: number
	speed: number
	length: number
}
export interface ISettingsSegmentWithVParts extends ISettingsSegment {
	steerDir: number
	speedRatio: number
	obLow: string
	obHigh: string
	obDistance: string
}
export interface ISettingsSegmentWithVPartsNBlocking
	extends ISettingsSegmentWithVParts {
	blockingId: number
	segmentId?: number
	disabledBy: string
	reason: string
	unUse: boolean
}

export interface ISettingsStationWithUnuse {
	id: number
	physicalId: string
	logicalId: string
	point: number
	direction: string
	carrierType?: number
	nextpoint: number
	offset: number
	unUse: boolean
}

export interface ISettingsBufferWithUnuse {
	id: number
	physicalId: string
	logicalId: string
	point: number
	direction: string
	nextpoint: number
	offset: number
	unUse: boolean
}

export interface ISettingsZcu {
	id: number
	x: number
	y: number
	usingType: number
	zcuType: number
	completePoints: string
	inputZones: ISettingsZcuInputZone[]
}

export interface ISettingsZcuInputZone {
	id: number
	zcuId: number
	priorityPoint: number
	zonePoints: string
}

export interface ISettingsVehicleReg {
	id: string
	logicalId: string
	railIn: boolean
	isNew?: boolean
}

export interface IVehicleRegForm {
	id: string
	logicalId: string
}

export interface ISettingsGroup {
	id: number
	objects?: any[]
	homePoints?: any[]
	stations?: any[]
	vehicles?: any[]
	buffers?: any[]
}

export interface ISettingsGroupedObject {
	id: number
	groupId: number
	referenceId: number
	referenceTable: string
}

export interface ISettingsCluster {
	id: number
	logicalId: string
	maxVehicles: number
	color?: string
}

export interface ISettingsClusterPoint {
	id: number
	pointId: number
	clusterId: number
}

export interface ISettingsAlternateTransfer {
	mode: string
	maxRetryToBuffer: number
	retryToNearStocker: boolean
	stationList?: any[]
}

export interface ISettingsAlternateStation {
	id: string
	logicalId: string
}

export interface ISettingsDelayedTransferTimeout {
	timeout: number
	warningNotify: boolean
	tableNotify: boolean
}
