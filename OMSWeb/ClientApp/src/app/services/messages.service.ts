import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';

import {
  ICommandMessage,
  IOrderCommandMessage,
  IVehicleCommandMessage,
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

  private sendCommand<T extends ICommandMessage>(command: T): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/command`, command);
  }
}
