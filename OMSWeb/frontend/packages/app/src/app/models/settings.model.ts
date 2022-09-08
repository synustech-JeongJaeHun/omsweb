import { ToggleOptionKeyType } from './enums'
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
	controlTables?: ControlTable
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
}

export class ControlTable {
	[key: string]: boolean
}

export const defaultControlTable: ControlTable = {
	orders: true,
	orders_id: true,
	orders_logicalId: true,
	orders_state: true,
	orders_vehicleId: true,
	orders_locationPickup: true,
	orders_locationDropoff: true,
	orders_locationMove: true,
	orders_priority: true,
	orders_carrierLabel: true,
	orders_timeCreated: true,
	orders_timeAssigned: true,
	orders_origin: true,
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
	orders_lastReassignType: true,

	vehicles: true,
	vehicles_id: true,
	vehicles_physicalId: true,
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
    vehicles_commandPoint: true,
    vehicles_destPoint: true,
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

	stations: true,
	stations_id: true,
	stations_physicalId: true,
	stations_logicalId: true,
	stations_group: true,
	stations_point: true,
	stations_direction: true,
	stations_carrierType: true,
	stations_nextPoint: true,
	stations_offset: true,
	stations_unuse: true,
	stations_carrierId: true,

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

	zcus: true,
	zcus_id: true,
	zcus_logicalId: true,
	zcus_using_type: true,
	zcus_type: true,
	zcus_status: true,
	zcus_errorCode: true,
	zcus_passVehicle: false,
	zcus_vehicleCount: false,
	zcus_vehicleInfo: false,

	cps: true,
	cps_server_id: true,
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
    cps_voltage_rs: false,
    cps_voltage_st: false,
    cps_voltage_tr: false,
    cps_current_r: false,
    cps_current_s: false,
    cps_current_t: false,
    cps_total_kw: false,
    cps_wh: false,
}

export class ClientPreferences implements IPreferences {
	toggles: ToggleOptionsType
	map: MapConfig
	uiStates?: UiStates
	theme?: ThemeConfig
	controlTables?: ControlTable

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
		} = JSON.parse(value)
		const {
			toggles: baseToggle = {},
			map: baseMap = {},
			controlTables: baseControlTable = {},
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
	}

	save() {
		const pref: IPreferences = {
			toggles: { ...this.toggles },
			map: { ...this.map },
			uiStates: { ...this.uiStates },
			theme: { ...this.theme },
			controlTables: { ...this.controlTables },
		}
		StorageUtil.setLocal(this.storeKey, JSON.stringify(pref))
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
  stationList?: any[]
}

export interface ISettingsAlternateStation {
  id: string
  logicalId: string
}

