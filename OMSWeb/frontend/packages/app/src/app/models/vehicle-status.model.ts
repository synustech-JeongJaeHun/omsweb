export interface IVehicleInfoRow {
  id: number;
  logicalId: string;
  physicalId?: string;
  movingState: string;
  distancePoint: number;
  distanceTotal: number;
  runtimeTotal: number;
  type: string;
  mapDb: string;
}

export interface IVehicleStatusRow extends IVehicleInfoRow {
  curPoint: number;
  cargoState: string;
  mode: string;
  hostOrder: boolean;
  orderOrigin: string;
  canBePushed: boolean;
  isSensorStopped: boolean;
  isZcuBlocked: boolean;
  isBlocked: boolean;
  errorList: string;

  orderId: number;
  commandPoint: string;

  locationPickup: string;
  locationDropoff: string;
  locationMove: string;

  groupId?: number;
}

export interface IVehicleSignal {
  removed: boolean;
  contain: boolean;
  connected: boolean;
  sensorStopped: boolean;
  isMain: boolean;
  hostOrderEnable: boolean;
  pushEnable: boolean;
}
export interface IRecentVehicleDio {
  vehicleId: number;
  di1: number;
  di2: number;
  di3: number;
  do1: number;
  do2: number;
  do3: number;
}
export interface IVehicleDioHistory {
  id: number;
  vehicleId: number;
  di1: number;
  di2: number;
  di3: number;
  do1: number;
  do2: number;
  do3: number;
  historyChangeTime: string;
  historyChangeType: string;
  historySourceId: number;
}

export interface IVehicleDioCategory {
  id: number;
  inCategory: string;
  inName: string;
  outCategory: string;
  outName: string;
}

export interface IVehicleStatus {
  id: number;
  physicalId: string;
  logicalId: string;
  movingState: string;
  distanceTotal: number;
  runtimeTotal: number;
  mapDb: string;
  curPoint: number;
  mode: string;
  canBePushed: boolean;
  hostOrder: boolean;
  orderOrigin: string;
  cargoState: string;
  isSensorStopped: boolean;
  isZcuBlocked: boolean;
  isBlocked: boolean;
  errorList: string;
  railIn: boolean;
  isMaint: boolean;
  isConnected: boolean;
  groupId: number;
  fireSensor: boolean;
}
