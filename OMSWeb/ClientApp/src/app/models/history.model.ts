import { IVehicleAlarm } from './notification.model';
import { IOrderInfoRow } from './order-status.model';
import { IVehicleInfoRow } from './vehicle-status.model';

export interface IOrderHistoryRow extends IOrderInfoRow {
  history_source_id: number;
  time_load_completed: Date;
  time_load_started: Date;
  time_unload_completed: Date;
  time_unload_started: Date;
  time_vehicle_arrived: Date;
}

export interface IVehicleHistoryRow extends IVehicleInfoRow {
  history_change_time?: Date;
  history_source_id?: number;
}

export interface IAlarmHistoryRow extends IVehicleAlarm {}
