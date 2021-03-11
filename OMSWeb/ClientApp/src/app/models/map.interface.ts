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
  segments_disabled?: any[];
  stations?: Station[];
  buffers?: Buffer[];
  mtls?: MTL[];
  clusters?: Cluster[];
  vehicles?: Vehicle[];
}
export interface ICoordinateInfo {
  coord: ICoordinate;
  inverted_coord?: ICoordinate;
  hasError?: boolean;
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
  coord_from: ICoordinateInfo;
  coord_to: ICoordinateInfo;
  path?: string;
}
export interface ISegment {
  id: number;
  logical_id: string;
  physical_id: string;
  point_from: IPoint;
  point_to: IPoint;
  type: string;
  location: string;
  direction: string;

  segment_parts: ISegmentPart[];
  path: string;
  dir_coord: any;
  dir_angle: any;
  bezier_points: any[];

  length: number;
  speed?: number;
  travel_time?: number;

  disable_state?: any;

  candidates?: any[];
  is_validate?: boolean;
  validate_text?: string;
  update_state?: string;
}

export interface IPoint {
  id?: number;
  coord: ICoordinate;
  inverted_coord: ICoordinate;
}
