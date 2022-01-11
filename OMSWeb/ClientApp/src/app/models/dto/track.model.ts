import { ICoordinate, IMapSize } from '../drawing.model';
import { MapTypes } from '../enums';

export namespace Dto {
  export interface IBuffer {
    id: number;
    direction: string;
    logicalId: string;
    physicalId: string;
    pointId: number;
    group?: number;
    nextpoint?: number;
    offset?: number;
  }
  export interface ICluster {
    id: number;
    color?: string;
    logicalId: string;
    maxVehicles: number;
    points?: string;
  }
  export interface IGroup {
    id: number;
    logicalId?: string;
    color?: string;
    objects?: any[];
  }

  export interface IGroupedObject {
    id: number;
    type: string;
  }
  export interface IMTL {
    id: number;
    logicalId: string;
    physicalId: string;
    pointId: number;
    group?: number;
    inUse?: boolean;
    position?: any;
    mode?: any;
    errorList?: any;
  }
  export interface IZcu {
    id: number;
    x: number;
    y: number;
    usingType: number;
    zcuType: number;
    inputZones: IZcuInputZone[];
    completePoints: IZcuCompletePoint[];
  }
  export interface IZcuInputZone {
    id: number;
    zcuId: number;
    priorityPoint: number;
    zonePoints: string;
  }
  export interface IZcuCompletePoint {
    id: number;
    zcuId: number;
    completePointId: number;
  }
  export interface IPoint extends ICoordinate {
    id: number;
    logicalId: string;
    physicalId: string;
    group?: number;
    isHome?: boolean;
  }
  export interface ISegPart {
    type?: string;
    direction?: string;
    location?: string;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  }
  export interface ISegment extends ISegPart {
    id: number;
    // type: string;
    // direction: SteerDirections;
    // location: string;
    // x1?: number;
    // y1?: number;
    // x2?: number;
    // y2?: number;

    startPoint?: number;
    endPoint?: number;
    length: number;
    logicalId: string;
    physicalId: string;
    segpartId?: number;
    segparts?: ISegPart[];
    speed: number;

    candidates?: any[];
    travelTime: any;
    isValidate?: boolean;
  }
  export interface IStation {
    id: number;
    logicalId: string;
    physicalId: string;
    direction: string;
    carrierType: string;
    pointId: number;
    group?: number;
    nextpoint?: number;
    offset?: number;
  }
  export interface IVehicle {
    id: number;
    canBePushed: boolean;
    cargoState: string;
    cargoTransferResult: string;
    curPoint?: number;
    nextPoint?: number;
    commandPoint?: any;
    errorList: string;
    isBlocked: boolean;
    isSensorStopped?: boolean;
    lastContact?: string;
    locationDropoff?: string;
    locationMove?: string;
    locationPickup?: string;
    logicalId: string;
    mapDb: string;
    mode: string;
    movingState: string;
    distancePoint: number;
    orderId: number;
    orderLogicalId: string;
    hostOrder: boolean;
    orderOrigin: string | string[];
    physicalId: string;
    priority?: any;
    type: string;
    group?: number;
    historyChangeTime?: any;
    isMaint: boolean;
    isConnected: boolean;
  }

  export interface IFixedTrackData {
    buffers?: IBuffer[];
    clusters?: ICluster[];
    groups?: IGroup[];
    mtls?: IMTL[];
    points?: IPoint[];
    size?: IMapSize;
    stations?: IStation[];
    zcus?: IZcu[];
  }
  export interface IVariableTrackData {
    segments?: ISegment[];
    segmentDisabled?: any[];
    vehicles?: IVehicle[];
  }
  export interface ITrackData extends IFixedTrackData, IVariableTrackData {
    vehiclePath?: any[];

    mapType?: MapTypes;
    width?: number;
    height?: number;
    minimumSegmentLength?: number;
  }

  export interface IVehicleTrackData {
    vehicles?: IVehicle[];
    vehiclePath?: any[];
  }

  export interface INodeInfo {
    id: number;
    logicalId?: string;
    physicalId?: string;
  }
}
