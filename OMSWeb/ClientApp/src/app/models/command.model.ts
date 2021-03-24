export interface ICommandMessage {
  type: string;
  action: string;
}

export interface IVehicleCommandMessage extends ICommandMessage {
  vehicleId?: string;
  orderOrigin?: string;
  canBePushed?: string;
  destination?: string;
  mode?: string;
  acceptManualCommands?: string;
}

export interface ITrackCommandMessage extends ICommandMessage {
  vehicleId?: string;
  segmentId?: string;
  source?: string;
  reason?: string;
  groupId?: string;
  objects?: string;
  color?: string;
  logicalId?: string;
}

export interface IOrderCommandMessage extends ICommandMessage {
  vehicleId?: string;
  orderId?: string;
  locationPickup?: string;
  locationDropoff?: string;
  locationMove?: string;
  carrierLabel?: string;
  priority?: string;
}
