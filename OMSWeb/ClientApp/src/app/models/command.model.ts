export interface ICommandMessage {
  type: string;
  action: string;
}

export interface IVehicleCommandMessage extends ICommandMessage {
  vehicle_id?: string;
  order_origin?: string;
  can_be_pushed?: string;
  destination?: string;
  mode?: string;
  accept_manual_commands?: string;
}

export interface ITrackCommandMessage extends ICommandMessage {
  vehicle_id?: string;
  segment_id?: string;
  source?: string;
  reason?: string;
  group_id?: string;
  objects?: string;
  color?: string;
  logical_id?: string;
}

export interface IOrderCommandMessage extends ICommandMessage {
  vehicle_id?: string;
  order_id?: string;
  location_pickup?: string;
  location_dropoff?: string;
  location_move?: string;
  carrier_label?: string;
  priority?: string;
}
