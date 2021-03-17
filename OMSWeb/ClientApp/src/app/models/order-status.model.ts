export type OrderStatesType =
  | 'FAILED'
  | 'ABORTED'
  | 'COMPLETED'
  | 'UNLOADED'
  | 'UNLOADING'
  | 'LOADED'
  | 'LOADING'
  | 'ARRIVED'
  | 'ASSIGNED'
  | 'UNASSIGNED';

export interface IOrderStatusRow {
  id: number;
  checked?: boolean;
  assignment_details: string;
  assignment_type: string;
  carrier_label: string;
  origin: string;
  logical_id: string;
  location_pickup: string;
  location_dropoff: string;
  location_move: string;
  state: OrderStatesType;
  vehicle_id: number;
  priority: number;
  time_created: Date;
  time_assigned : Date;
  time_completed: Date;
  time_aborted: Date;
  time_failed: Date;
  duration_total: number;
  duration_dropoff: number;
  duration_unassigned: number;
  duration_pickup: number;
  duration_load: number;
  duration_unload: number;
  duration_move: number;

  distance_pickup: number;
  distance_dropoff: number;
  distance_move: number;

  row_num: number;
}
