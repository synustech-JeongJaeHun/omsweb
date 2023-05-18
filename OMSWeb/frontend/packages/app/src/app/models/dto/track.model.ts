import { ICoordinate, IMapSize } from '../drawing.model'
import { MapTypes } from '../enums'

export namespace Dto {
	export interface IBuffer {
		id: number
		direction: string
		logicalId: string
		physicalId: string
		pointId: number
		group?: number
		nextpoint?: number
		nextPoint?: number
		offset?: number
		unuse?: boolean
		carrierId?: string
	}
	export interface ICluster {
		id: number
		color?: string
		logicalId: string
		maxVehicles: number
		points?: string
	}
  export interface IClusterState {
    id: number
    backup_id: string
    server_id: number
    status: string

    current_igbt?: string
    current_r?: string
    current_s?: string
    current_t?: string
    current_track?: string
    error_code?: string
    frequency?: string
    logicalId?: string
    sync?: string
    temp_internal?: string
    temp_radiator?: string
    total_kw?: string
    voltage?: string
    voltage_rs?: string
    voltage_st?: string
    voltage_tr?: string
    wh?: string
  }
	export interface IGroup {
		id: number
		logicalId?: string
		color?: string
		objects?: any[]
	}

	export interface IGroupedObject {
		id: number
		type: string
	}
	export interface IMTL {
		id: number
		logicalId: string
		physicalId: string
		pointId: number
		group?: number
		unuse?: boolean
		position?: any
		mode?: any
		errorList?: any
		inDirection: 'R' | 'A'
		outDirection: 'R' | 'A'
    inLockSegment: string
    outLockSegment: string
    inNode: number
    outNode: number
    inDisabledSegment: number
    outDisabledSegment: number
	}
	export interface IZcu {
		id: number
		x: number
		y: number
		usingType: number
		zcuType: number
		inputZones: IZcuInputZone[]
		completePoints: IZcuCompletePoint[]
		error: boolean
	}
	export interface IZcuInputZone {
		id: number
		zcuId: number
		priorityPoint: number
		zonePoints: string
	}
	export interface IZcuCompletePoint {
		id: number
		zcuId: number
		completePointId: number
	}
	export interface IZcuStatus {
		id: number
		runStatus: number
		errorCode: number
		passVehicle: string[]
		vehicleCount: string[]
		vehicleInfo: string[]
	}
	export interface IFireShutter {
		id: number
		x: number
		y: number
		logicalId: string
		segments: string
		status: number
	}
	export interface IFireShutterStatus {
		id: number
		logicalId: string
		segments: string
		status: number
		statusMsg: string
	}
	export interface IPoint extends ICoordinate {
		id: number
		logicalId: string
		physicalId: string
		group?: number
		homeId?: number
	}
	export interface ISegPart {
		type?: string
		direction?: string
		location?: string
		x1?: number
		y1?: number
		x2?: number
		y2?: number
	}
	export interface ISegment extends ISegPart {
		id: number
		// type: string;
		// direction: SteerDirections;
		// location: string;
		// x1?: number;
		// y1?: number;
		// x2?: number;
		// y2?: number;

		startPoint?: number
		endPoint?: number
		length: number
		logicalId: string
		physicalId: string
		segpartId?: number
		segparts?: ISegPart[]
		speed: number

		candidates?: any[]
		travelTime: any
		isValidate?: boolean

    startPointDto?: IPoint
    endPointDto?: IPoint
	}
	export interface IStation {
		id: number
		logicalId: string
		physicalId: string
		direction: string
		carrierType: string
		pointId: number
		group?: number
		nextpoint?: number
		offset?: number
		unuse?: boolean
		carrierId?: string
	}
	export interface IVehicle {
		id: number
		canBePushed: boolean
		cargoState: string
    cargoTransferResult: string
    carrierId: string
		curPoint?: number
		nextPoint?: number
    destPoint?: string
		commandPoint?: any
		errorList: string
    isBlocked: boolean
    isZcuBlocked: boolean
		isSensorStopped?: boolean
		lastContact?: string
		locationDropoff?: string
		locationMove?: string
		locationPickup?: string
		logicalId: string
		mapDb: string
		mode: string
		movingState: string
		distancePoint: number
		fireSensor: boolean
		orderId: number
		orderLogicalId: string
		hostOrder: boolean
		orderOrigin: string | string[]
		physicalId: string
		priority?: any
		type: string
		group?: number
		historyChangeTime?: any
		isMaint: boolean
		isConnected: boolean
    user?: string
    note?: string
	}

	export interface IFixedTrackData {
		buffers?: IBuffer[]
		clusters?: ICluster[]
        clusterStates?: IClusterState[]
		groups?: IGroup[]
		mtls?: IMTL[]
		points?: IPoint[]
		size?: IMapSize
		stations?: IStation[]
		zcus?: IZcu[]
		fireShutters?: IFireShutter[]

    backdrops?: IBackdrop[]
	}
	export interface IVariableTrackData {
		segments?: ISegment[]
		segmentDisabled?: any[]
		vehicles?: IVehicle[]
	}
	export interface ITrackData extends IFixedTrackData, IVariableTrackData {
		vehiclePath?: any[]

		mapType?: MapTypes
		width?: number
		height?: number
		minimumSegmentLength?: number
	}

	export interface IVehicleTrackData {
		vehicles?: IVehicle[]
		vehiclePath?: any[]
	}

	export interface INodeInfo {
		id: number
		logicalId?: string
		physicalId?: string
    }

  export interface IBackdrop {
    id: number
    logicalId: string
    x?: number
    y?: number
    width?: number
    height?: number
    backgroundColor?: string
    outlineThickness?: number
    outlineColor?: string
    outlineRadius?: number
    outlineType?: number
    contents: string
    direction?: number
    vAlign?: number
    hAlign?: number
    bold: number
    italic: boolean
    fontSize: number
  }
}
