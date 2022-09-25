import { OrderStatesType } from './enums';

export interface IOrderInfoRow {
  id: number;
  origin: string;
  logicalId: string;
  state: OrderStatesType;
  locationPickup: string;
  locationDropoff: string;
  locationMove: string;
  assignmentDetails: string;
  assignmentType: string;
  carrierLabel: string;
  vehicleId: number;
  priority: number;
  timeCreated: Date;
  timeAssigned: Date;
  timeCompleted: Date;
  timeAborted: Date;
  timeFailed: Date;

  distancePickup: number;
  distanceDropoff: number;
  distanceMove: number;
}

export interface IOrderStatusRow extends IOrderInfoRow {
  durationTotal: number;
  durationDropoff: number;
  durationUnassigned: number;
  durationPickup: number;
  durationLoad: number;
  durationUnload: number;
  durationMove: number;
  statusDetails: string;
}
