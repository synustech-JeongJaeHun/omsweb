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
  IVehicleRegCommandMessage,
  ISegmentCommandMessage,
  IClusterCommandMessage,
  IGroupCommandMessage,
  ISettingZcuCommandMessage,
  IZcuCommandMessage
} from '../models/command.model';
import { IOrderStatusRow } from '../models/order-status.model';
import { IVehicleStatusRow } from '../models/vehicle-status.model';
import { IZcuStatusRow } from '../models/zcu-status.model';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private baseUrl = '/api/messages';
  constructor(private http: HttpClient) { }

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

  sendSettingZcuCommand(
    command: ISettingZcuCommandMessage
  ): Observable<void> {
    return this.sendCommand<ISettingZcuCommandMessage>(command);
  }

  sendZcuCommand(
    command: IZcuCommandMessage
  ): Observable<void> {
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

  sendMaxVehiclesClusterCommand(
    command: IClusterCommandMessage
  ): Observable<void> {
    command.type = command.type;
    command.action = command.action;
    command.clusterId = command.clusterId;
    command.maxVehicles = command.maxVehicles;

    return this.sendCommand<IClusterCommandMessage>(command);
  }

  sendAssignVehicleGruopCommand(
    command: IGroupCommandMessage
  ): Observable<void> {
    command.type = command.type;
    command.action = command.action;
    command.vehicleId = command.vehicleId;
    command.vehicleIds = command.vehicleIds;

    return this.sendCommand<IGroupCommandMessage>(command);
  }

  sendAssignHomeGruopCommand(
    command: IGroupCommandMessage
  ): Observable<void> {
    command.type = command.type;
    command.action = command.action;
    command.homeId = command.homeId;
    command.homeIds = command.homeIds;

    return this.sendCommand<IGroupCommandMessage>(command);
  }

  sendAssignStationGruopCommand(
    command: IGroupCommandMessage
  ): Observable<void> {
    command.type = command.type;
    command.action = command.action;
    command.stationId = command.stationId;
    command.stationIds = command.stationIds;

    return this.sendCommand<IGroupCommandMessage>(command);
  }

  sendAssignBufferGruopCommand(
    command: IGroupCommandMessage
  ): Observable<void> {
    command.type = command.type;
    command.action = command.action;
    command.bufferId = command.bufferId;
    command.bufferIds = command.bufferIds;

    return this.sendCommand<IGroupCommandMessage>(command);
  }

  private sendCommand<T extends ICommandMessage>(command: T): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/command`, command);
  }
}
