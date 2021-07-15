import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';

import {
  ICommandMessage,
  ITrackCommandMessage,
  IOrderCommandMessage,
  IVehicleCommandMessage,
  IAllCommandMessage,
  IAiModeCommandMessage,
  ITscStateCommandMessage,
  IControlStateCommandMessage,
} from '../models/command.model';
import { IOrderStatusRow } from '../models/order-status.model';
import { IVehicleStatusRow } from '../models/vehicle-status.model';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private baseUrl = '/api/messages';
  constructor(private http: HttpClient) {}

  sendDeleteOrder(order: IOrderStatusRow): Observable<void> {
    const {
      vehicleId,
      id: orderId,
      locationPickup,
      locationDropoff,
      locationMove,
      priority,
      carrierLabel,
    } = order;
    return this.sendOrderCommand({
      type: 'ORDER',
      action: 'A',
      orderId,
      vehicleId,
      orderOrigin: 'OMS',
      locationPickup,
      locationDropoff,
      locationMove,
      priority,
      carrierLabel,
    });
  }

  sendControlStateCommand(command: IControlStateCommandMessage): Observable<void> {
    return this.sendCommand<IControlStateCommandMessage>(command);
  }

  sendTscStateCommand(command: ITscStateCommandMessage): Observable<void> {
    return this.sendCommand<ITscStateCommandMessage>(command);
  }

  sendAIModeCommand(command: IAiModeCommandMessage): Observable<void> {
    return this.sendCommand<IAiModeCommandMessage>(command);
  }

  sendVehicleAllCommand(command: IAllCommandMessage): Observable<void> {
    command.type = 'VEHICLE_ALL';
    return this.sendCommand<IAllCommandMessage>(command);
  }

  sendVehicleCommand(
    command: IVehicleCommandMessage,
    targets: IVehicleStatusRow[] = []
  ): Observable<void> {
    command.type = 'VEHICLE';
    command.vehicleIds = targets.map(x => x.id);

    return this.sendCommand<IVehicleCommandMessage>(command);
  }

  sendOrderCommand(command: IOrderCommandMessage): Observable<void> {
    return this.sendCommand<IOrderCommandMessage>(command);
  }

  sendDisableSegmentCommand(
    command: ITrackCommandMessage,
    targets: number
  ): Observable<void> {
    command.segmentId = targets;
    command.source = "uid-admin";

    return this.sendCommand<ITrackCommandMessage>(command);
  }

  private sendCommand<T extends ICommandMessage>(command: T): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/command`, command);
  }
}
