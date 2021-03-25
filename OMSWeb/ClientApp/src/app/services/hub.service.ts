import { EventEmitter, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import * as camelcaseKeys from 'camelcase-keys';

import { IDataChangeEvent } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class HubService {
  //#region event subjects
  connectionChanged$: EventEmitter<boolean> = new EventEmitter<boolean>();
  pointChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  segmentChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  segmentDisabledChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  stationChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  bufferChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  mtlChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  vehicleChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  vehicleTableChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  orderTableChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  vehiclePathChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  clusterChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  groupChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  alarmChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  alertChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  serverStatusChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter();
  //#endregion

  public isConnected = false;
  private hub: signalR.HubConnection;

  constructor() {
    this.hub = new signalR.HubConnectionBuilder().withUrl('/hubs/oms').build();
    this.registerEvents();
    this.connect();
    setInterval(() => this.connect(), 5000);
  }

  private connect() {
    if (this.isConnected) return;
    console.log('## start connect to hub ...');
    this.hub
      .start()
      .then(() => {
        this.isConnected = true;
        console.info('## hub connected ##');
      })
      .catch((err) => console.error(err));
  }

  private registerEvents() {
    this.hub.onclose((err) => {
      this.isConnected = false;
      this.connectionChanged$.emit(false);
      console.info('## hub disconnected ##');
      err && console.error(err);
    });

    this.hub.on('pointChanged', (d) => {
      console.info('## hub message : pointChanged >>', d);
      this.pointChanged$.emit(d);
    });
    this.hub.on('segmentChanged', (d) => {
      console.info('## hub message : segmentChanged >>', d);
      this.segmentChanged$.emit(d);
    });
    this.hub.on('segmentDisabledChanged', (d) => {
      console.info('## hub message : segmentDisabledChanged >>', d);
      this.segmentDisabledChanged$.emit(d);
    });
    this.hub.on('stationChanged', (d) => {
      console.info('## hub message : stationChanged >>', d);
      this.stationChanged$.emit(d);
    });
    this.hub.on('bufferChanged', (d) => {
      console.info('## hub message : bufferChanged >>', d);
      this.bufferChanged$.emit(d);
    });
    this.hub.on('mtlChanged', (d) => {
      console.info('## hub message : mtlChanged >>', d);
      this.mtlChanged$.emit(d);
    });
    this.hub.on('vehicleChanged', (d) => {
      console.info('## hub message : vehicleChanged >>', d);
      this.vehicleChanged$.emit(d);
    });
    this.hub.on('vehicleTableChanged', (d) => {
      console.info('## hub message : vehicleTableChanged >>', d);
      this.vehicleTableChanged$.emit(d);
    });
    this.hub.on('orderTableChanged', (d) => {
      console.info('## hub message : orderTableChanged >>', d);
      this.orderTableChanged$.emit(d);
    });
    this.hub.on('vehiclePath', (d) => {
      console.info('## hub message : vehiclePath >>', d);
      this.vehiclePathChanged$.emit(d);
    });
    this.hub.on('clusterChanged', (d) => {
      console.info('## hub message : clusterChanged >>', d);
      this.clusterChanged$.emit(d);
    });
    this.hub.on('groupChanged', (d) => {
      console.info('## hub message : groupChanged >>', d);
      this.groupChanged$.emit(d);
    });
    this.hub.on('alarm', (d) => {
      console.info('## hub message : alarm >>', d);
      this.alarmChanged$.emit(d);
    });
    this.hub.on('alert', (d) => {
      console.info('## hub message : alert >>', d);
      this.alertChanged$.emit(d);
    });
    this.hub.on('serverStatus', (d) => {
      console.info('## hub message : serverStatus >>', d);
      this.serverStatusChanged$.emit(d);
    });
  }
}
