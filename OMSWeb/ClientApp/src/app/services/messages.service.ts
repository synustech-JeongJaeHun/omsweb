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
  IAlarmClearCommandMessage,
  IWarningClearCommandMessage,
  IStationCommandMessage,
  IBufferCommandMessage,
  IAllSegmentCommandMessage,
  IZcuCommandMessage,
  IVehicleRegCommandMessage,
  ISegmentCommandMessage
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

  sendAlarmClearCommand(command: IAlarmClearCommandMessage, targets: number[] = [], error_code: number): Observable<void> {
    command.vehicleIds = targets;
    command.alarmCode = error_code;
    return this.sendCommand<IAlarmClearCommandMessage>(command);
  }

  sendWarningClearCommand(command: IWarningClearCommandMessage, targets: number[] = [], ackBy: string): Observable<void> {
    command.WarningIds = targets;
    command.WarningAckBy = ackBy;
    return this.sendCommand<IWarningClearCommandMessage>(command);
  }

  sendServerModuleControlCommand(command: IControlStateCommandMessage): Observable<void> {
    command.type = 'MODULE';
    return this.sendCommand<IControlStateCommandMessage>(command);
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

  sendVehicleDirectCommand(
    command: IVehicleCommandMessage,
    targets: number[] = []
  ): Observable<void> {
    command.type = 'VEHICLE';
    command.vehicleIds = targets;
    return this.sendCommand<IVehicleCommandMessage>(command);
  }

  sendOrderCommand(command: IOrderCommandMessage): Observable<void> {
    return this.sendCommand<IOrderCommandMessage>(command);
  }

  sendDisableSegmentCommand(
    command: ITrackCommandMessage,
    targets: number
  ): Observable<void> {
    command.type = command.type;
    command.segmentId = targets;
    command.source = "uid-admin";

    return this.sendCommand<ITrackCommandMessage>(command);
  }

  sendDisableSegmentsCommand(
    command: ITrackCommandMessage,
    targets: number[] = []
  ): Observable<void> {
    command.type = command.type;
    command.segmentIds = targets;
    command.source = "uid-admin";

    return this.sendCommand<ITrackCommandMessage>(command);
  }

  sendStationUseCommand(
    command: IStationCommandMessage,
    targets: number[] = []
  ): Observable<void> {
    command.type = command.type;
    command.action = command.action;
    command.stationIds = targets;

    return this.sendCommand<IStationCommandMessage>(command);
  }

  sendBufferUseCommand(
    command: IBufferCommandMessage,
    targets: number[] = []
  ): Observable<void> {
    command.type = command.type;
    command.action = command.action;
    command.bufferIds = targets;

    return this.sendCommand<IBufferCommandMessage>(command);
  }

  sendAllSpeedRatioSegmentCommand(
    command: IAllSegmentCommandMessage,
    targets: number
  ): Observable<void> {
    //command.type = command.type;
    command.type = 'SEGMENT_ALL';
    command.speedRatio = targets;

    return this.sendCommand<IAllSegmentCommandMessage>(command);
  }

  sendSpeedRatioSegmentCommand(
    command: ISegmentCommandMessage
  ): Observable<void> {
    command.type = command.type;
    command.action = command.action;
    command.segmentId = command.segmentId;
    command.speedRatio = command.speedRatio;
    command.segmentIds = command.segmentIds;
    command.speedRatios = command.speedRatios;

    return this.sendCommand<ISegmentCommandMessage>(command);
  }

  sendZcuUsingTypeCommand(
    command: IZcuCommandMessage
  ): Observable<void> {
    command.type = command.type;
    command.zcuId = command.zcuId;
    command.zcuUsingType = command.zcuUsingType;

    return this.sendCommand<IZcuCommandMessage>(command);
  }

  sendZcusUsingTypeCommand(
    command: IZcuCommandMessage
  ): Observable<void> {
    command.type = command.type;
    command.zcuIds = command.zcuIds;
    command.zcuUsingType = command.zcuUsingType;

    return this.sendCommand<IZcuCommandMessage>(command);
  }

  sendVehicleRegAddCommand(
    command: IVehicleRegCommandMessage
  ): Observable<void> {
    command.type = command.type;
    command.action = command.action;
    command.vehicleId = command.vehicleId;
    command.logicalId = command.logicalId;

    return this.sendCommand<IVehicleRegCommandMessage>(command);
  }

  sendVehicleRegUpdateCommand(
    command: IVehicleRegCommandMessage
  ): Observable<void> {
    command.type = command.type;
    command.action = command.action;
    command.vehicleId = command.vehicleId;
    command.logicalId = command.logicalId;

    return this.sendCommand<IVehicleRegCommandMessage>(command);
  }

  sendVehicleRegRemoveCommand(
    command: IVehicleRegCommandMessage
  ): Observable<void> {
    command.type = command.type;
    command.action = command.action;
    command.vehicleId = command.vehicleId;
    command.vehicleIds = command.vehicleIds;

    return this.sendCommand<IVehicleRegCommandMessage>(command);
  }

  private sendCommand<T extends ICommandMessage>(command: T): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/command`, command);
  }
}
