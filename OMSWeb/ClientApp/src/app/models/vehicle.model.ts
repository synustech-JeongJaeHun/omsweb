import { Dto } from './dto/track.model';

export class Vehicle {
  id: number;
  logical_id: string;
  physical_id?: string;

  cur_point: any;
  next_point: any;
  command_point: any;

  cargo_state: string;
  moving_state: string;
  hotlot: boolean;
  mode: string;
  push: boolean;
  call: string[];
  error_list: string;
  is_blocked: boolean;
  order_id: number;
  order_logical_id: string;
  last_contact: number;
  is_stale: boolean;
  is_moved: boolean;
  type: string;
  group?: number;
  cargo_transfer_result: string;
  map_db: string;

  order_origin?: string;
  can_be_pushed?: boolean;
  is_sensor_stopped?: boolean;
  location_dropoff?: string;
  location_move?: string;
  location_pickup?: string;
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
      logical_id,
      physical_id,
      cargo_state,
      moving_state,
      mode,
      error_list,
      is_blocked,
      order_id,
      order_logical_id,
      type,
      group,
      cargo_transfer_result,
      map_db,
      can_be_pushed, // push
      order_origin, // call
    } = row;

    this.id = id;
    this.logical_id = logical_id;
    this.physical_id = physical_id;
    this.cargo_state = cargo_state;
    this.moving_state = moving_state;

    this.mode = mode;
    this.error_list = error_list;
    this.is_blocked = is_blocked;
    this.order_id = order_id;
    this.order_logical_id = order_logical_id;
    this.type = type || 'STANDARD';
    this.group = group;
    this.cargo_transfer_result = cargo_transfer_result;
    this.map_db = map_db;

    this.is_moved = false;
    this.is_stale = false;

    this.call = Array.isArray(order_origin)
      ? order_origin
      : order_origin.split(',').map((x) => x.trim());
    this.push = can_be_pushed;

    this.cur_point = currentPoint;
    this.next_point = nextPoint;
    this.command_point = commandPoint;

    this.last_contact = lastContact;
    this.hotlot = hotLot;
  }

  copy() {
    let cur_point: any;
    if (this.cur_point != undefined) {
      cur_point = {};
      cur_point = { ...this.cur_point };
      cur_point.coord = { ...this.cur_point.coord };
      cur_point.inverted_coord = { ...this.cur_point.inverted_coord };
    }

    let next_point;
    if (this.next_point != undefined) {
      next_point = {};
      next_point = { ...this.next_point };
      next_point.coord = { ...this.next_point.coord };
      next_point.inverted_coord = { ...this.next_point.inverted_coord };
    }

    let command_point;
    if (this.command_point != undefined) {
      command_point = {};
      command_point = { ...this.command_point };
      command_point.coord = { ...this.command_point.coord };
      command_point.inverted_coord = { ...this.command_point.inverted_coord };
    }

    let copied_vehicle = new Vehicle(
      {
        id: this.id,
        physical_id: this.physical_id,
        logical_id: this.logical_id,
        cargo_state: this.cargo_state,
        moving_state: this.moving_state,
        mode: this.mode,
        can_be_pushed: this.push,
        order_origin: this.call,
        error_list: this.error_list,
        is_blocked: this.is_blocked,
        order_id: this.order_id,
        order_logical_id: this.order_logical_id,
        type: this.type,
        group: this.group,
        cargo_transfer_result: this.cargo_transfer_result,
        map_db: this.map_db,
      },
      cur_point,
      next_point,
      command_point,
      this.last_contact,
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

    if (now - this.last_contact > stale_interval) {
      this.is_stale = true;
    } else {
      this.is_stale = false;
    }
  }
}
