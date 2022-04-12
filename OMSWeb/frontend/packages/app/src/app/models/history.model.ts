import { IVehicleAlarm } from './notification.model';
import { IOrderInfoRow } from './order-status.model';
import { IVehicleInfoRow } from './vehicle-status.model';

export interface IOrderHistoryRow extends IOrderInfoRow {
  historySourceId: number;
  timeLoadCompleted: Date;
  timeLoadStarted: Date;
  timeUnloadCompleted: Date;
  timeUnloadStarted: Date;
  timeVehicleArrived: Date;
}

export interface IVehicleHistoryRow extends IVehicleInfoRow {
  historyChangeTime?: Date;
  historySourceId?: number;
}

export interface IAlarmHistoryRow extends IVehicleAlarm { }
