export interface IVehicleInfoRow {
  id: number;
  logicalId: string;
  physicalId?: string;
  movingState: string;
  distanceTotal: number;
  runtimeTotal: number;
  type: string;
  mapDb: string;
}

export interface IVehicleStatusRow extends IVehicleInfoRow {
  curPoint: number;
  cargoState: string;
  mode: string;
  orderOrigin: string;
  canBePushed: boolean;
  isSensorStopped: boolean;
  isBlocked: boolean;
  errorList: string;

  orderId: number;
  commandPoint: string;

  locationPickup: string;
  locationDropoff: string;
  locationMove: string;

  rowNum: number;
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

export interface IVehicleDIO {
  id: number;
  category: string;
  name: string;
  value: boolean;
}

export interface IVehicleDIOStates {
  vehicleDI: IVehicleDIO[];
  vehicleDO: IVehicleDIO[];
  categories: string[];
}
