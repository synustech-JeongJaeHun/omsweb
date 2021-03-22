export interface INotificationCount {
  level1: number;
  level2: number;
  level3: number;
  levelUnknown?: number;
}

export class NotificationCount implements INotificationCount {
  level1: number = 0;
  level2: number = 0;
  level3: number = 0;
  levelUnknown?: number = 0;

  get critical(): number {
    return this.level3;
  }

  get total(): number {
    return this.level1 + this.level2 + this.level3 + this.levelUnknown;
  }

  constructor(props: INotificationCount) {
    Object.assign(this, props);
  }
}

export interface IAlert {
  id: number;
  time: Date;
  level: number;
  tag?: string;
  message: string;
  ack_time?: Date;
  ack_by?: string;
}

export interface IVehicleAlarm {
  id: number;
  time: Date;
  age: number;
  vehicle_id: number;
  error_code: number;
  time_resolved?: Date;

  level?: number;
  descriptioN?: string;
  action?: string;
}
