export interface ICommandMessage {
  type: string;
  action: string;
}

export interface IVehicleCommandMessage extends ICommandMessage {
  vehicleId?: string;
  orderOrigin?: string;
  canBePushed?: boolean;
  destination?: string;
  mode?: string;
  acceptManualCommands?: string;
}

export interface ITrackCommandMessage extends ICommandMessage {
  vehicleId?: string;
  segmentId?: number;
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
  locationPickup?: string;
  locationDropoff?: string;
  locationMove?: string;
  carrierLabel?: string;
  priority?: number;
}
