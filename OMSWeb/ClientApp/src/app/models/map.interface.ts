import { ICoordinate } from './drawing.model';
import { Group } from './group.model';
import { Point } from './point.model';
import { Segment } from './segment.model';
import { Vehicle } from './vehicle.model';
import { Station } from './station.model';
import { MTL } from './mtl.model';
import { Cluster } from './cluster.model';
import { Buffer } from './buffer.model';

export interface IViewerData {
  groups?: Group[];
  points?: Point[];
  segments?: Segment[];
  segmentsDisabled?: any[];
  stations?: Station[];
  buffers?: Buffer[];
  mtls?: MTL[];
  clusters?: Cluster[];
  vehicles?: Vehicle[];
}
export interface ICoordinateInfo {
  coord: ICoordinate;
  invertedCoord?: ICoordinate;
  isError?: boolean;
}
export interface ISegmentSummary {
  type: string;
  location: string;
  direction: string;
}
export interface ISegmentPart {
  id?: number;
  radius?: number;
  type?: string;
  direction?: string;
  location?: string;
  coordFrom: ICoordinateInfo;
  coordTo: ICoordinateInfo;
  path?: string;
}

export interface ISegmentPath {
  id: number;
  path: string;
  pointFrom: IPoint;
  pointTo: IPoint;
  type: string;
}
export interface ISegment extends ISegmentPath {
  logicalId: string;
  physicalId: string;
  location: string;
  direction: string;

  segmentParts: ISegmentPart[];
  dirCoord: any;
  dirAngle: any;
  bezierPoints: any[];

  length: number;
  speed?: number;
  travelTime?: number;

  disableState?: any;

  candidates?: any[];
  isValidate?: boolean;
  validateText?: string;
  updateState?: string;
}

export interface IPoint {
  id?: number;
  coord: ICoordinate;
  invertedCoord: ICoordinate;
}

export type VehicleDestinationType = 'go' | 'load' | 'unload';

export type MapEventType =
  | 'click'
  | 'contextmenu'
  | 'mouseenter'
  | 'mouseout'
  | 'backdrop'
  | 'selectUnit';
export interface IMapMouseEvent {
  type: MapEventType;
  targetId?: number;
  targetType?: string;
  targetData?: any;
  mapMode?: string;
  groupType?: string; //'OVERLAP' | 'OVERLAP_MODULE' | 'UNASSIGNED_MODULE' | 'LAYOUT';
  position?: ICoordinate;
}
