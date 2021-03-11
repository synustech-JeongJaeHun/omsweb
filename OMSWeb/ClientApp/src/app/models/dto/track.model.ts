import { ICoordinate, IMapSize } from '../drawing.model';
import { MapTypes, ObjectDirections, SteerDirections } from '../enums';

export namespace Dto {
  export interface IBuffer {
    id: number;
    direction: string;
    logical_id: string;
    physical_id: string;
    point_id: number;
    group?: number;
  }
  export interface ICluster {
    id: number;
    color?: string;
    logical_id: string;
    max_vehicles: number;
    points?: string;
  }
  export interface IGroup {
    id: number;
    logical_id: string;
    color: string;
    objects: any[];
  }
  export interface IMTL {
    id: number;
    logical_id: string;
    physical_id: string;
    point_id: number;
    group?: number;
    in_use?: boolean;
    position?: any;
    mode?: any;
    error_list?: any;
  }
  export interface IPoint extends ICoordinate {
    id: number;
    logical_id: string;
    physical_id: string;
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

    start_point?: number;
    end_point?: number;
    length: number;
    logical_id: string;
    physical_id: string;
    segpart_id?: number;
    segparts?: ISegPart[];
    speed: number;

    candidates?: any[];
    travel_time: any;
    is_validate?: boolean;
  }
  export interface IStation {
    id: number;
    logical_id: string;
    physical_id: string;
    direction: string;
    carrier_type: string;
    point_id: number;
    group?: number;
  }
  export interface IVehicle {
    id: number;
    can_be_pushed: boolean;
    cargo_state: string;
    cargo_transfer_result: string;
    cur_point?: number;
    next_point?: number;
    command_point?: any;
    error_list: string;
    is_blocked: boolean;
    is_sensor_stopped?: boolean;
    last_contact?: string;
    location_dropoff?: string;
    location_move?: string;
    location_pickup?: string;
    logical_id: string;
    map_db: string;
    mode: string;
    moving_state: string;
    order_id: number;
    order_logical_id: string;
    order_origin: string | string[];
    physical_id: string;
    priority?: any;
    type: string;
    group?: number;
    history_change_time?:any;
  }

  export interface ITrackData {
    buffers?: IBuffer[];
    clusters?: ICluster[];
    groups?: IGroup[];
    mtls?: IMTL[];
    points?: IPoint[];
    segments?: ISegment[];
    size?: IMapSize;
    stations?: IStation[];
    vehicles?: IVehicle[];

    vehicle_path?: any[];
    segment_disabled?: any[];

    map_type?: MapTypes;
    width?: number;
    height?: number;
    minimum_segment_length?: number;

  }
}
