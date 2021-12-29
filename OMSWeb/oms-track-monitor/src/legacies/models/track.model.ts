import { ICoordinate, IMapSize } from './drawing.model';
import { MapTypes } from '../Enums';

interface IBuffer {
  id: number;
  direction: string;
  logicalId: string;
  physicalId: string;
  pointId: number;
  group?: number;
  nextpoint?: number;
  offset?: number;
}
interface ICluster {
  id: number;
  color?: string;
  logicalId: string;
  maxVehicles: number;
  points?: string;
}
interface IGroup {
  id: number;
  logicalId?: string;
  color?: string;
  objects?: any[];
}

interface IGroupedObject {
  id: number;
  type: string;
}
interface IMTL {
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
interface IZcu {
  id: number;
  x: number;
  y: number;
  usingType: number;
  zcuType: number;
  inputZones: IZcuInputZone[];
  completePoints: IZcuCompletePoint[];
}
interface IZcuInputZone {
  id: number;
  zcuId: number;
  priorityPoint: number;
  zonePoints: string;
}
interface IZcuCompletePoint {
  id: number;
  zcuId: number;
  completePointId: number;
}
interface IPoint extends ICoordinate {
  id: number;
  logicalId: string;
  physicalId: string;
  group?: number;
  isHome?: boolean;
}
interface ISegPart {
  type?: string;
  direction?: string;
  location?: string;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}
interface ISegment extends ISegPart {
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
interface IStation {
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
interface IVehicle {
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
}

interface IFixedTrackData {
  buffers?: IBuffer[];
  clusters?: ICluster[];
  groups?: IGroup[];
  mtls?: IMTL[];
  points?: IPoint[];
  size?: IMapSize;
  stations?: IStation[];
  zcus?: IZcu[];
}
interface IVariableTrackData {
  segments?: ISegment[];
  segmentDisabled?: any[];
  vehicles?: IVehicle[];
}
interface ITrackData extends IFixedTrackData, IVariableTrackData {
  vehiclePath?: any[];

  mapType?: MapTypes;
  width?: number;
  height?: number;
  minimumSegmentLength?: number;
}

interface IVehicleTrackData {
  vehicles?: IVehicle[];
  vehiclePath?: any[];
}

interface INodeInfo {
  id: number;
  logicalId?: string;
  physicalId?: string;
}


export { ITrackData, IVehicle, ISegment }