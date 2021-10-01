export interface ICommandMessage {
  type?: string;
  action: string;
}

export interface IControlStateCommandMessage extends ICommandMessage {
  state?: string;
}

export interface ITscStateCommandMessage extends ICommandMessage {
  state?: string;
}

export interface IAiModeCommandMessage extends ICommandMessage {
  mode?: string;
}

export interface IAlarmClearCommandMessage extends ICommandMessage {
  vehicleIds?: number[];
  alarmCode?: number;
}

export interface IWarningClearCommandMessage extends ICommandMessage {
  WarningIds?: number[];
  WarningAckBy?: string;
}

export interface IAllCommandMessage extends ICommandMessage {
  vehicleId?: string;
}

export interface IVehicleCommandMessage extends ICommandMessage {
  vehicleId?: string;
  vehicleIds?: number[];
  orderOrigin?: string;
  hostOrder?: boolean;
  canBePushed?: boolean;
  acceptManualCommands?: string;

  destination?: string;
  mode?: string;
}

export interface ITrackCommandMessage extends ICommandMessage {
  vehicleId?: string;
  segmentId?: number;
  segmentIds?: number[];
  source?: string;
  reason?: string;
  groupId?: number;
  objects?: string;
  color?: string;
  logicalId?: string;
}

export interface IOrderCommandMessage extends ICommandMessage {
  vehicleId?: number;
  orderId?: number;
  orderOrigin?: string;
  locationPickupType?: string;
  locationDropoffType?: string;
  locationMoveType?: string;
  locationPickup?: string;
  locationDropoff?: string;
  locationMove?: string;
  carrierLabel?: string;
  priority?: number;
}

export interface IStationCommandMessage extends ICommandMessage {
  stationIds?: number[];
}

export interface IBufferCommandMessage extends ICommandMessage {
  bufferIds?: number[];
}

export interface IAllSegmentCommandMessage extends ICommandMessage {
  speedRatio?: number;
}

export interface IZcuCommandMessage extends ICommandMessage {
  zcuId?: number;
  zcuIds?: number[];
  zcuUsingType?: string;
}
