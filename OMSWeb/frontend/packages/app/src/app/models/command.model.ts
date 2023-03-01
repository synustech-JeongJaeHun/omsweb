export interface ICommandMessage {
	type?: string
	action: string
}

export interface IMapUpdateCommandMessage extends ICommandMessage {
	map_db_name?: string
	map_source_file?: string
}

export interface IOnlineStateCommandMessage extends ICommandMessage {
  state?: string
}

export interface IControlStateCommandMessage extends ICommandMessage {
	state?: string
}

export interface ITscStateCommandMessage extends ICommandMessage {
	state?: string
}

export interface IAiModeCommandMessage extends ICommandMessage {
	mode?: string
}

export interface IAlarmClearCommandMessage extends ICommandMessage {
	vehicleIds?: number[]
	alarmCode?: number
}

export interface IWarningClearCommandMessage extends ICommandMessage {
	WarningIds?: number[]
	WarningAckBy?: string
}

export interface IAllCommandMessage extends ICommandMessage {
	vehicleId?: string
}

export interface IVehicleCommandMessage extends ICommandMessage {
	vehicleId?: string
	vehicleIds?: number[]
	orderOrigin?: string
	hostOrder?: boolean
	canBePushed?: boolean
	acceptManualCommands?: string

	destination?: string
	mode?: string
	direction?: string

    mtlId?: string

    user?: string
    note?: string
}

export interface ITrackCommandMessage extends ICommandMessage {
	vehicleId?: string
	segmentId?: number
	segmentIds?: number[]
	source?: string
	reason?: string
	groupId?: number
	objects?: string
	color?: string
    logicalId?: string

    user?: string
    note?: string
}

export interface IOrderCommandMessage extends ICommandMessage {
	vehicleId?: number
	orderId?: number
	orderOrigin?: string
	locationPickupType?: string
	locationDropoffType?: string
	locationMoveType?: string
	locationPickup?: string
	locationDropoff?: string
	locationMove?: string
	carrierLabel?: string
	priority?: number
	commandID?: string

  VehicleFlag?: number
  CarrierLoc?: String
}

export interface IStationCommandMessage extends ICommandMessage {
	stationIds?: number[]
    unused: number
    user?: string
    note?: string
}

export interface IBufferCommandMessage extends ICommandMessage {
	bufferIds?: number[]
    unused: number
    user?: string
    note?: string
}

export interface ICarrierCommandMessage extends ICommandMessage {
    logicalId?:string
	bufferId?: number
	vehicleId?: number
    carrierLabel?: string
    newCarrierId?: string
	manual?: boolean
	user?: string
	note?: string
}

export interface ISegmentCommandMessage extends ICommandMessage {
	segmentId?: number
	segmentIds?: number[]
	speedRatio?: number
	speedRatios?: number[]
}

export interface IAllSegmentCommandMessage extends ICommandMessage {
	speedRatio?: number
}

export interface ISettingZcuCommandMessage extends ICommandMessage {
	action: 'zcu-setting'
	zcuIds: number[]
	zcuUsingType:
		| 'none' // NOT_USE
		| 'hw' // USING_HW
		| 'sw' // USING_SW
}

export interface IZcuCommandMessage extends ICommandMessage {
	zcuId?: number
	zcuIds?: number[]

  zcuUsingType?: string
}

export interface IVehicleRegCommandMessage extends ICommandMessage {
	vehicleId?: number
	vehicleIds?: number[]
	logicalId?: string
	logicalIds?: string[]
}

export interface IClusterCommandMessage extends ICommandMessage {
	clusterId?: number
	maxVehicles?: number
}

export interface IGroupCommandMessage extends ICommandMessage {
	groupId?: number
	homeId?: number
	homeIds?: number[]
	homeIds_removed?: number[]
	stationId?: number
	stationIds?: number[]
	stationIds_removed?: number[]
	bufferId?: number
	bufferIds?: number[]
	bufferIds_removed?: number[]
	vehicleId?: number
	vehicleIds?: number[]
	vehicleIds_removed?: number[]
}

export interface IEnableHomeCommandMessage extends ICommandMessage {
	action: 'enable-home'
	pointId: number
	groupIds: number[]
}
export interface IDisableHomeCommandMessage extends ICommandMessage {
	action: 'disable-home'
	pointId: number
}

export interface IToggleHomeModeCommandMessage extends ICommandMessage {
	action: 'home_mode'
	mode: 'change'
}

export interface IChangeHomeModeCommandMessage extends ICommandMessage {
  action: 'home_mode'
  mode: string
}

export interface IChangeIvrModeCommandMessage extends ICommandMessage {
  action: 'ivr_mode'
  mode: string
}

export interface IToggleChainManualCommandDisabledCommandMessage
	extends ICommandMessage {
	action: 'chain_manual_command_disabled'
	mode: 'change'
}

export interface IResetVehicleMileageTotalCommandMessage
    extends ICommandMessage {
    action: 'reset_vehicle_mileage_total'
    mode: string
    vehicleId?: number
    vehicleIds?: number[]
}


