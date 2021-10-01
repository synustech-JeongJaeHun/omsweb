import { Dto } from './dto/track.model';

export class Vehicle {
  objectType = 'Vehicle';
  id: number;
  logicalId: string;
  physicalId?: string;

  curPoint: any;
  nextPoint: any;
  commandPoint: any;

  cargoState: string;
  movingState: string;
  distancePoint: number;
  hotlot: boolean;
  mode: string;
  push: boolean;
  call: string[];
  errorList: string;
  isBlocked: boolean;
  orderId: number;
  orderLogicalId: string;
  lastContact: number;
  isStale: boolean;
  isMoved: boolean;
  type: string;
  group?: number;
  cargoTransferResult: string;
  mapDb: string;

  hostOrder?: boolean;
  orderOrigin?: string;
  canBePushed?: boolean;
  isSensorStopped?: boolean;
  locationDropoff?: string;
  locationMove?: string;
  locationPickup?: string;
  priority?: string;

  index?: number;

  constructor(
    row: Dto.IVehicle,
    currentPoint: any,
    nextPoint: any,
    commandPoint: any,
    lastContact: number,
    hotLot: boolean
  ) {
    const {
      id,
      logicalId,
      physicalId,
      cargoState,
      movingState,
      distancePoint,
      mode,
      errorList,
      isSensorStopped,
      isBlocked,
      orderId,
      orderLogicalId,
      type,
      group,
      cargoTransferResult,
      mapDb,
      canBePushed, // push
      hostOrder,
      orderOrigin = [], // call
    } = row;

    this.id = id;
    this.logicalId = logicalId;
    this.physicalId = physicalId;
    this.cargoState = cargoState;
    this.movingState = movingState;
    this.distancePoint = distancePoint;

    this.mode = mode;
    this.errorList = errorList;
    this.isSensorStopped = isSensorStopped;
    this.isBlocked = isBlocked;
    this.orderId = orderId;
    this.orderLogicalId = orderLogicalId;
    this.type = type || 'STANDARD';
    this.group = group;
    this.cargoTransferResult = cargoTransferResult;
    this.mapDb = mapDb;

    this.isMoved = false;
    this.isStale = false;

    this.hostOrder = hostOrder;
    this.call = orderOrigin
      ? Array.isArray(orderOrigin)
        ? orderOrigin
        : orderOrigin.split(',').map((x) => x.trim())
      : [];
    this.push = canBePushed;

    this.curPoint = currentPoint;
    this.nextPoint = nextPoint;
    this.commandPoint = commandPoint;

    this.lastContact = lastContact;
    this.hotlot = hotLot;
  }

  copy() {
    let curPoint: any;
    if (this.curPoint != undefined) {
      curPoint = {};
      curPoint = { ...this.curPoint };
      curPoint.coord = { ...this.curPoint.coord };
      curPoint.invertedCoord = { ...this.curPoint.invertedCoord };
    }

    let nextPoint;
    if (this.nextPoint != undefined) {
      nextPoint = {};
      nextPoint = { ...this.nextPoint };
      nextPoint.coord = { ...this.nextPoint.coord };
      nextPoint.invertedCoord = { ...this.nextPoint.invertedCoord };
    }

    let commandPoint;
    if (this.commandPoint != undefined) {
      commandPoint = {};
      commandPoint = { ...this.commandPoint };
      commandPoint.coord = { ...this.commandPoint.coord };
      commandPoint.invertedCoord = { ...this.commandPoint.invertedCoord };
    }

    let copied_vehicle = new Vehicle(
      {
        id: this.id,
        physicalId: this.physicalId,
        logicalId: this.logicalId,
        cargoState: this.cargoState,
        movingState: this.movingState,
        distancePoint: this.distancePoint,
        mode: this.mode,
        canBePushed: this.push,
        hostOrder: this.hostOrder,
        orderOrigin: this.call,
        errorList: this.errorList,
        isSensorStopped: this.isSensorStopped,
        isBlocked: this.isBlocked,
        orderId: this.orderId,
        orderLogicalId: this.orderLogicalId,
        type: this.type,
        group: this.group,
        cargoTransferResult: this.cargoTransferResult,
        mapDb: this.mapDb,
      },
      curPoint,
      nextPoint,
      commandPoint,
      this.lastContact,
      this.hotlot
    );

    return copied_vehicle;
  }
  check_stale(stale_interval, custom_time) {
    // custom_time must come in a epoch format
    let now;

    // update sec to ms
    stale_interval = stale_interval * 1000;

    if (custom_time && custom_time > -1) {
      now = custom_time;
    } else {
      now = new Date().getTime();
    }

    if (now - this.lastContact > stale_interval) {
      this.isStale = true;
    } else {
      this.isStale = false;
    }
  }
}
