import { OrderStatesType } from './enums';

export interface IOrderInfoRow {
  origin: string;
  logical_id: string;
  state: OrderStatesType;
  location_pickup: string;
  location_dropoff: string;
  location_move: string;
  assignment_details: string;
  assignment_type: string;
  carrier_label: string;
  vehicle_id: number;
  priority: number;
  time_created: Date;
  time_assigned: Date;
  time_completed: Date;
  time_aborted: Date;
  time_failed: Date;

  distance_pickup: number;
  distance_dropoff: number;
  distance_move: number;

  row_num: number;
}

export interface IOrderStatusRow extends IOrderInfoRow {
  id: number;
  checked?: boolean;
  duration_total: number;
  duration_dropoff: number;
  duration_unassigned: number;
  duration_pickup: number;
  duration_load: number;
  duration_unload: number;
  duration_move: number;
}
