export interface IVehicleStatusRow {
  id: number;
  logical_id: string;
  physical_id?: string;

  cur_point: number;
  moving_state: string;
  map_db: string;
  cargo_state: string;
  mode: string;
  order_origin: string;
  can_be_pushed: boolean;
  is_sensor_stopped: boolean;
  is_blocked: boolean;
  error_list: string;
  distance_total: number;
  runtime_total: number;
  type: string;

  order_id: number;
  command_point: string;

  location_pickup: string;
  location_dropoff: string;
  location_move: string;

  row_num: number;
}
