import { EventEmitter, Injectable } from '@angular/core'
import * as signalR from '@microsoft/signalr'

import { IDataChangeEvent } from '../models/notification.model'

const showLogger = false

@Injectable({
	providedIn: 'root',
})
export class HubService {
	//#region event subjects
	pointChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	connectionChanged$: EventEmitter<boolean> = new EventEmitter<boolean>()
	segmentChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	segmentDisabledChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	stationChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	bufferChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	mtlChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	vehicleChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	vehicleTableChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	vehicleDioChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	orderTableChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	vehiclePathChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	clusterChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	groupChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	alarmChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	alertChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	serverStatusChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	modeStateChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	settingModeChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	zcuMapChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	zcuStatusTableChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	fireShutterMapChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	fireShutterStatusTableChanged$: EventEmitter<IDataChangeEvent> =
		new EventEmitter()
  clusterStatusChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	clusterStatusTableChanged$: EventEmitter<IDataChangeEvent> =
		new EventEmitter()
	kpiChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	homeChanged$: EventEmitter<IDataChangeEvent> = new EventEmitter()
	//#endregion

	public isConnected = false
	private hub: signalR.HubConnection

	constructor() {
		this.hub = new signalR.HubConnectionBuilder()
			.withUrl('/hubs/oms')
			.withAutomaticReconnect([0, 0, 0, 500, 1000, 2000, 5000, 10000, 30000])
			.configureLogging(signalR.LogLevel.Debug)
			.build()

		this.hub.onclose((err) => {
			console.assert(!err, err)
			this.isConnected = false
			this.connectionChanged$.emit(false)
			console.log('# Hub connection closed.')
		})

		this.hub.onreconnecting((err) => {
			console.assert(!err, err)
			this.isConnected = false
			this.connectionChanged$.emit(false)
			console.log('# Hub re-connecting...')
		})

		this.hub.onreconnected(() => {
			this.isConnected = true
			this.connectionChanged$.emit(true)
			console.info('## Hub re-connected. ##')
		})

		this.attachEvents()
		this.start()
	}
	public start() {
		this.connect()
		// setInterval(() => this.connect(), 5000)
	}
	public stop() {
		// this.detachEvents();
		this.hub.stop().then(() => {
			console.info('## Hub stopped. ##')
		})
	}

	private connect() {
		if (this.isConnected) return
		this.hub
			.start()
			.then(() => {
				this.isConnected = true
				this.connectionChanged$.emit(true)
				console.info('## Hub connected. ##')
			})
			.catch((err) => console.error(err))
	}

	private detachEvents() {
		// this.hub.off('pointChanged');
		this.hub.off('segmentChanged')
		this.hub.off('segmentDisabledChanged')
		this.hub.off('stationChanged')
		this.hub.off('bufferChanged')
		this.hub.off('mtlChanged')
		this.hub.off('vehicleChanged')
		this.hub.off('vehicleTableChanged')
		this.hub.off('vehicleDioChanged')
		this.hub.off('orderTableChanged')
		this.hub.off('vehiclePath')
		this.hub.off('clusterChanged')
		this.hub.off('groupChanged')
		this.hub.off('alarm')
		this.hub.off('alert')
		this.hub.off('serverStatus')
		this.hub.off('modeState')
		this.hub.off('settingMode')
		this.hub.off('zcuMapChanged')
		this.hub.off('zcuStatusTableChanged')
		this.hub.off('fireShutterMapChanged')
		this.hub.off('fireShutterStatusTableChanged')
    this.hub.off('clusterStatusChanged')
		this.hub.off('clusterStatusTableChanged')
		this.hub.off('kpiChanged')
		this.hub.off('homeChanged')
	}

	private attachEvents() {
		this.hub.on('pointChanged', (meta, body) => {
			console.info('## hub message : pointChanged >>', { meta, body })
			this.pointChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('segmentChanged', (meta, body) => {
			console.info('## hub message : segmentChanged >>', { meta, body })
			this.segmentChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('segmentDisabledChanged', (meta, body) => {
			console.info('## hub message : segmentDisabledChanged >>', {
				meta,
				body,
			})
			this.segmentDisabledChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('stationChanged', (meta, body) => {
			console.info('## hub message : stationChanged >>', { meta, body })
			this.stationChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('bufferChanged', (meta, body) => {
			console.info('## hub message : bufferChanged >>', { meta, body })
			this.bufferChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('mtlChanged', (meta, body) => {
			console.info('## hub message : mtlChanged >>', { meta, body })
			this.mtlChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('vehicleChanged', (meta, body) => {
			console.info('## hub message : vehicleChanged >>', meta.id, {
				meta,
				body,
			})
			this.vehicleChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('vehicleTableChanged', (meta, body) => {
			console.info('## hub message : vehicleTableChanged >>', { meta, body })
			this.vehicleTableChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('vehicleDioChanged', (meta, body) => {
			this.vehicleDioChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('orderTableChanged', (meta, body) => {
			console.info('## hub message : orderTableChanged >>', { meta, body })
			this.orderTableChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('vehiclePath', (meta, body) => {
			console.info('## hub message : vehiclePath >>', { meta, body })
			this.vehiclePathChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('clusterChanged', (meta, body) => {
			console.info('## hub message : clusterChanged >>', { meta, body })
			this.clusterChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('groupChanged', (meta, body) => {
			console.info('## hub message : groupChanged >>', { meta, body })
			this.groupChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('alarm', (meta, body) => {
			console.info('## hub message : alarm >>', { meta, body })
			this.alarmChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('alert', (meta, body) => {
			console.info('## hub message : alert >>', { meta, body })
			this.alertChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('serverStatus', (meta, body) => {
			console.info('## hub message : serverStatus >>', { meta, body })
			this.serverStatusChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('modeState', (meta, body) => {
			console.info('## hub message : modeState >>', { meta, body })
			this.modeStateChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('settingMode', (meta, body) => {
			console.info('## hub message : settingMode >>', { meta, body })
			this.settingModeChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('zcuMapChanged', (meta, body) => {
			console.info('## hub message : zcuMapChanged >>', { meta, body })
			this.zcuMapChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('zcuStatusTableChanged', (meta, body) => {
			console.info('## hub message : zcuStatusTableChanged >>', { meta, body })
			this.zcuStatusTableChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('fireShutterMapChanged', (meta, body) => {
			console.info('## hub message : fireShutterMapChanged >>', { meta, body })
			this.fireShutterMapChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('fireShutterStatusTableChanged', (meta, body) => {
			console.info('## hub message : fireShutterStatusTableChanged >>', {
				meta,
				body,
			})
			this.fireShutterStatusTableChanged$.emit({ ...meta, data: body })
		})
    this.hub.on('clusterStatusChanged', (meta, body) => {
      console.info('## hub message : clusterStatusChanged >>', { meta, body })
			this.clusterStatusChanged$.emit({ ...meta, data: body })
    })
		this.hub.on('clusterStatusTableChanged', (meta, body) => {
			console.info('## hub message : clusterStatusTableChanged >>', {
				meta,
				body,
			})
			this.clusterStatusTableChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('kpiChanged', (meta, body) => {
			console.info('## hub message : kpiChanged >>', { meta, body })
			this.kpiChanged$.emit({ ...meta, data: body })
		})
		this.hub.on('homeChanged', (meta, body) => {
			console.info('## hub message : homeChanged >>', { meta, body })
			this.homeChanged$.emit({ ...meta, data: body })
		})
	}
}
