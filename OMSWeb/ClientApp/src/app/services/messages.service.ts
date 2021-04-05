import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';

import {
  ICommandMessage,
  IOrderCommandMessage,
  IVehicleCommandMessage,
} from '../models/command.model';
import { IOrderStatusRow } from '../models/order-status.model';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private baseUrl = '/api/messages';
  constructor(private http: HttpClient) {}

  sendPing(): Observable<void> {
    return this.sendVehicleCommand({
      type: 'VEHICLE',
      vehicleId: '*',
      action: 'status',
    });
  }
  sendVehicleReset(): Observable<void> {
    return this.sendVehicleCommand({
      type: 'VEHICLE',
      vehicleId: '*',
      action: 'reset',
    });
  }
  sendEStop(): Observable<void> {
    return this.sendVehicleCommand({
      type: 'VEHICLE',
      vehicleId: '*',
      action: 'stop',
    });
  }
  sendSetAuto(): Observable<void> {
    console.warn('@ action value 확인 (auto ?)');
    return this.sendVehicleCommand({
      type: 'VEHICLE',
      vehicleId: '*',
      action: 'auto', // @TODO auto action 값 확인
    });
  }
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

  sendVehicleCommand(command: IVehicleCommandMessage): Observable<void> {
    return this.sendCommand<IVehicleCommandMessage>(command);
  }

  sendOrderCommand(command: IOrderCommandMessage): Observable<void> {
    return this.sendCommand<IOrderCommandMessage>(command);
  }

  private sendCommand<T extends ICommandMessage>(command: T): Observable<void> {
    // console.warn('@@ dummy response >>', this.baseUrl, command);
    // return EMPTY; // @TODO remove : test code
    return this.http.post<void>(`${this.baseUrl}/command`, command);
  }
}
