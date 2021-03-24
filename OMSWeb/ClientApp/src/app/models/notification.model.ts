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
  ackTime?: Date;
  ackBy?: string;
}

export interface IVehicleAlarm {
  id: number;
  time: Date;
  age: number;
  vehicleId: number;
  errorCode: number;
  timeResolved?: Date;

  level?: number;
  description?: string;
  action?: string;
}
