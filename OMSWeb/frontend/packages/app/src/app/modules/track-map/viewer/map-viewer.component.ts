import {
	Component,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
} from '@angular/core'
import { Router } from '@angular/router'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { PermissionEnums, ViewModes } from '../../../models/enums'
import { Dto } from '../../../models/dto/track.model'
import { IPreferences } from '../../../models/settings.model'
import { HubService } from '../../../services/hub.service'
import { IDataChangeEvent } from '../../../models/notification.model'
import { AuthService } from '../../../services/auth.service'

import '@daimre/oms-track-monitor'
import {
	OmsTrackMonitorElement,
	IOmsTrackMonitor,
} from '@daimre/oms-track-monitor'
import { StatusService } from '@oms/root/services/status.service'
import { MapStatesService } from '../map-states.service'
import { SettingsService } from '@oms/root/services/settings.service'
import { TrackStatusService } from '../../../services/track-status.service'
import { TrackMonitorSettingService } from '../../../services/track-monitor-setting.service'
import d3 = require('d3')
import { TranslateService } from '@ngx-translate/core'
import { MessagesService } from '@oms/root/services/messages.service'
import { DialogService } from '@oms/root/services/dialog.service'
import { IVehicleCommandMessage } from '@oms/root/models/command.model'
import { SystemStatusService } from '@oms/root/services/system-status.service'
import { TracksService } from '@oms/root/services/tracks.service'
@Component({
	selector: 'oms-map-viewer',
	templateUrl: './map-viewer.component.html',
	styleUrls: ['./map-viewer.component.scss'],
})
export class MapViewerComponent implements OnInit, OnDestroy {
	@Input() preference: IPreferences
	@Input() viewMode: ViewModes
	@Input() trackData: Dto.ITrackData

	private viewer: IOmsTrackMonitor
	private destroy$: Subject<void> = new Subject<void>()
	public detailsVisible = false

	private cameraAndRotationSyncId

	get tmSetting() {
		return this.trackMonitorSettingService.trackSetting
	}

	get canSetSource() {
		return !this.mapStatesService.transferCommandState.sourceDisabled
	}
	get canSetDest() {
		return !this.mapStatesService.transferCommandState.destDisabled
	}

	get canSetSourceWithFilter() {
		const logicalId = this.contextMenuObject.value.logicalId
		if (logicalId == null) return false
		if (this.mapStatesService.transferCommandState.sourceDisabled === true)
			return false
		if (
			this.systemStatusService.manualTransferFilterSetting
				.sourceFilterEnabled === false
		)
			return true

		return this.systemStatusService.manualTransferFilterSetting.sourceWords.some(
			(word) => logicalId.includes(word),
		)
	}
	get canSetDestWithFilter() {
		const logicalId = this.contextMenuObject.value.logicalId
		if (logicalId == null) return false
		if (this.mapStatesService.transferCommandState.destDisabled === true)
			return false
		if (
			this.systemStatusService.manualTransferFilterSetting
				.destinationFilterEnabled === false
		)
			return true

		return this.systemStatusService.manualTransferFilterSetting.destinationWords.some(
			(word) => logicalId.includes(word),
		)
	}

	get canSetDestPoint() {
		const isTabMove =
			this.mapStatesService.transferCommandState.category === 'move'
		return this.canSetDest && isTabMove
	}

	public viewerSetting = {
		rect: {
			width: window.innerWidth,
			height:
				window.innerHeight -
				40 -
				(this.mapStatesService.statusTableHeight === 0
					? 0
					: this.mapStatesService.statusTableHeight + 50),
		},
	}

	public selectedObject: any
	public tooltipObject: { type: string; value: any } | undefined
	public showTooltip = false
	public contextMenuObject: { type: string; value: any } | undefined
	public showContextMenu = false
	public homeActive = false

	public colocatedViewPosition:
		| { top: string; left: string; right: string }
		| undefined
	public colocatedObjects = []
	public mainColocatedObject: any
	public showColocatedView = false

	get activeDetails(): boolean {
		return this.detailsVisible && this.auth.isAuthenticated
	}
	get showToolbarText(): boolean {
		return this.settingSvc.globalPreferences.toggles.showToolName
	}

	get isHomeModeAndTscPaused() {
		const isHomeMode = this.systemStatusService.homeMode ?? false

		const isTSCPaused =
			this.systemStatusService.systemStates.tscMode === 0 ||
			this.systemStatusService.systemStates.tscMode === 1 ||
			this.systemStatusService.systemStates.tscMode === 2

		return isHomeMode && isTSCPaused
	}

	get homeColor() {
		const isHomeMode = this.systemStatusService.homeMode ?? false
		return isHomeMode ? '#ff510080' : undefined
	}

	get stationMargin() {
		return this.systemStatusService.nodeMarginSetting?.stationMargin
	}
	get bufferMargin() {
		return this.systemStatusService.nodeMarginSetting?.bufferMargin
	}

	constructor(
		private router: Router,
		private auth: AuthService,
		private hubSvc: HubService,
		private statusService: StatusService,
		private mapStatesService: MapStatesService,
		private settingSvc: SettingsService,
		private tracksService: TracksService,
		private trackStatusService: TrackStatusService,
		private trackMonitorSettingService: TrackMonitorSettingService,
		private messageSvc: MessagesService,
		private dialogSvc: DialogService,
		private $t: TranslateService,
		private systemStatusService: SystemStatusService,
	) {
		this.auth.certUpdated$.pipe(takeUntil(this.destroy$)).subscribe((cert) => {
			this.router.navigateByUrl('/', { skipLocationChange: false }).then(() => {
				this.router.navigate([cert ? '/monitor/status' : '/'])
			})
		})
	}

	hasPermissions(permissions: number[]): boolean {
		return this.auth.hasPermissions(permissions)
	}
	readonly permissionEnums: typeof PermissionEnums = PermissionEnums

  isZcuWithFireshutter(id: number){
    return this.systemStatusService.zcusWithFireshutter.includes(id)
  }

	ngOnInit(): void {
		// @ts-ignore
		this.viewer = document.getElementById('track-canvas')._instance.exposed
		// @ts-ignore
		this.viewer.setTrack({
			...this.trackData,
			segmentParts: this.trackData.segments,
			clusters: this.trackData.clusters.map((c) => ({
				...c,
				// @ts-ignore
				segments: c.segments.split(',').map((id) => parseInt(id.trim())),
			})),
		})
		this.attachEvents()
		this.attachHubEvents()

		this.viewer.setCameraAndRotation({
			position: this.tmSetting.position ?? {
				x: (this.trackData.size.minX + this.trackData.size.maxX) / 2,
				y: (this.trackData.size.minY + this.trackData.size.maxY) / 2,
			},
			viewBoxWidth: this.tmSetting.viewBoxWidth,
			rotation: this.tmSetting.rotation,
		})

		this.cameraAndRotationSyncId = setInterval(() => {
			this.getCameraAndRotation()
		}, 500)

		this.trackMonitorSettingService.rotationChanged.subscribe((rotation) =>
			this.viewer.setCameraAndRotation({ rotation }),
		)
	}
	ngOnDestroy(): void {
		this.destroy$.next()
		this.destroy$.complete()

		clearInterval(this.cameraAndRotationSyncId)
	}

	private attachEvents() {
		this.mapStatesService.toolbarToggleEvent$
			.pipe(takeUntil(this.destroy$))
			.subscribe((event) => {
				if (event.type === 'itemDetails') {
					this.detailsVisible = event.value
				} else if (event.type === 'controlTable') {
					// setTimeout(() => {
					//   this.viewer.adjust_floaters();
					// }, 100);
				} else {
					// this.viewer?.onChangeVisibility(event);
				}
			})
		this.mapStatesService.toolbarCommandEvent$
			.pipe(takeUntil(this.destroy$))
			.subscribe((event) => {
				// this.viewer.onCommandAction(event);
			})
		this.mapStatesService.configChangeEvent$
			.pipe(takeUntil(this.destroy$))
			.subscribe((event) => {
				// this.viewer.onChangeConfig(event);
			})

		this.mapStatesService.actionState$
			.pipe(takeUntil(this.destroy$))
			.subscribe((event) => {
				// this.onMapMouseEvent(event)
			})

		this.mapStatesService.statusTableResizeEvent$
			.pipe(takeUntil(this.destroy$))
			.subscribe((tableHeightNum) => {
				this.viewerSetting.rect.height =
					window.innerHeight -
					40 -
					(tableHeightNum === 0 ? 0 : tableHeightNum + 50)
			})
	}
	private attachHubEvents() {
		if ([ViewModes.public, ViewModes.viewer].includes(this.viewMode)) {
			this.hubSvc.connectionChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((conn) => {
					this.statusService.getVehicles().subscribe((res) => {
						console.log('connection update', conn, res)
						if (conn && res?.vehicles) {
							res.vehicles.forEach((v) =>
								this.viewer.updateVehicle('UPDATE', v),
							)
						}
					})
				})

			this.hubSvc.vehicleChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((e: IDataChangeEvent) => {
					// @ts-ignore
					this.viewer.updateVehicle(e.operation, e.data)
				})
			this.hubSvc.segmentChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((e: IDataChangeEvent) => {
					// TODO what happened on event?
					console.log('segment update', e)
				})
			this.hubSvc.segmentDisabledChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((e: IDataChangeEvent) => {
					this.viewer.updateSegmentDisabled(e.operation, {
						id: e.id,
						operation: e.operation,
						data: e.data,
					})

					if (this.contextMenuObject) {
						this.contextMenuObject.value.disabled =
							this.trackStatusService.trackData.segmentDisabled.some(
								(sd) => sd.segmentId === this.contextMenuObject.value.id,
							)
					}
					if (this.selectedObject) {
						this.selectedObject.disabled =
							this.trackStatusService.trackData.segmentDisabled.some(
								(sd) => sd.segmentId === this.selectedObject.id,
							)
					}
				})
			this.hubSvc.clusterChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((e: IDataChangeEvent) => {
					// TODO what happened on event?
					console.log('cluster update', e)
				})

			this.hubSvc.zcuMapChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((e) => {
					this.viewer.updateZcu(e.operation, e.data)
				})

			this.hubSvc.fireShutterMapChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((e) => {
					this.viewer.updateFireshutter(e.operation, e.data)
				})

			this.hubSvc.stationChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((e) => {
					// @ts-ignore
					this.viewer.updateStation(e.operation, { id: e.id, unuse: e.unuse })
				})

			this.hubSvc.bufferChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((e) => {
					// @ts-ignore
					this.viewer.updateBuffer(e.operation, { id: e.id, unuse: e.unuse })
				})

			this.hubSvc.groupChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((e) => {
					this.viewer.updateGroupObject(
						e.operation,
						{
							id: e.id as number,
							groupId: e.groupId as number,
							referenceId: e.referenceId as number,
							referenceTable: e.referenceTable as string,
						},
						e.data,
					)
				})

			this.hubSvc.homeChanged$.pipe(takeUntil(this.destroy$)).subscribe((e) => {
				this.viewer.updateHome(e.operation, {
					id: e.id as number,
					point: e.point as number,
				})
			})

			// if (this.auth.isAuthenticated) {
			// this.hubSvc.vehiclePathChanged$
			// 	.pipe(takeUntil(this.destroy$))
			// 	.subscribe((e: IDataChangeEvent) => {
			// 		// TODO what happened on event?
			// 		console.log('vehicle path update', e)
			// 	})

			// this.hubSvc.mtlChanged$
			// 	.pipe(takeUntil(this.destroy$))
			// 	.subscribe((e) => {
			// 		// TODO what happened on event?
			// 		console.log('mtl update', e)
			// 	})
			// }
		}
	}

	changeFocus(event: any) {
		this.selectedObject = event
		// @ts-ignore
		this.focusOnTM({ type: event.objectType, id: event.id })
	}

	onToggleStationUnuse(id: number, toState: 'UNUSE' | 'USE') {
		const message =
			toState === 'USE'
				? { type: 'USE', action: 'station-setting', unused: 0 }
				: { type: 'UNUSE', action: 'station-setting', unused: 1 }

		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmCommand') })
			.subscribe((ok) => {
				if (ok) {
					this.messageSvc.sendStationSettingCommand(message, [id]).subscribe()
					this.showContextMenu = false
				}
			})
	}

	onToggleBufferUnuse(id: number, toState: 'UNUSE' | 'USE') {
		const message =
			toState === 'USE'
				? { type: 'USE', action: 'buffer-setting', unused: 0 }
				: { type: 'UNUSE', action: 'buffer-setting', unused: 1 }

		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmCommand') })
			.subscribe((ok) => {
				if (ok) {
					this.messageSvc.sendBufferSettingCommand(message, [id]).subscribe()
					this.showContextMenu = false
				}
			})
	}

	onVehicleCommand(name: string) {
		let commandMessage: IVehicleCommandMessage
		let needConfirm: boolean = false

		switch (name) {
			case 'initialize':
				commandMessage = { action: 'initialize' } //auto
				needConfirm = true
				break
			case 'reset':
				commandMessage = { action: 'reset' }
				needConfirm = true
				break
			case 'stop':
				commandMessage = { action: 'stop' } // estop
				needConfirm = true
				break
			case 'zcu_go':
				commandMessage = { action: 'zcu_go' }
				break
			case 'push:enable':
				commandMessage = { action: 'set_behavior', canBePushed: true }
				break
			case 'hostOrder:enable':
				commandMessage = { action: 'set_behavior', hostOrder: true }
				break
			case 'rail_out':
				commandMessage = { action: 'rail_out' }
				break
			default:
				commandMessage = { action: name }
				break
		}

		if (needConfirm) {
			this.dialogSvc
				.confirm({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((ok) => {
					ok &&
						this.messageSvc
							.sendVehicleCommand(commandMessage, [
								this.contextMenuObject.value,
							])
							.subscribe()
				})
		} else {
			this.messageSvc
				.sendVehicleCommand(commandMessage, [this.contextMenuObject.value])
				.subscribe()
		}
	}

	onApplyZcuChange() {
		let origin = this.contextMenuObject.value.usingType
		let change = origin === 1 ? 2 : 1
		this.contextMenuObject.value.usingType = change

		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmZcuChange') })
			.subscribe((confirm) => {
				if (confirm) {
					this.messageSvc
						.sendSettingZcuCommand({
							type: 'ZCU',
							action: 'zcu-setting',
							zcuIds: [this.contextMenuObject.value.id],
							zcuUsingType: change === 1 ? 'hw' : 'sw',
						})
						.subscribe()
				} else {
					this.contextMenuObject.value.usingType = origin
				}
			})
	}
	onResetHWZcu() {
		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmZcuReset') })
			.subscribe((confirm) => {
				if (confirm) {
					this.messageSvc
						.sendZcuCommand({
							action: 'zcu_reset',
							zcuId: this.contextMenuObject.value.id,
						})
						.subscribe()
				}
			})
	}
	onSetSource(objectType) {
		const { id, logicalId, physicalId } = this.contextMenuObject.value
		this.mapStatesService.transferCommandState.source = {
			objectType,
			id,
			logicalId,
			physicalId,
		}
	}
	onSetDest(objectType) {
		const { id, logicalId, physicalId } = this.contextMenuObject.value
		this.mapStatesService.transferCommandState.dest = {
			objectType,
			id,
			logicalId,
			physicalId,
		}
	}
	onRemoveCarrier(carrierId: string) {
		this.tracksService
			.getCarrierInfo(this.contextMenuObject.value.logicalId)
			.subscribe(
				(res) => {
					if (res.carrierId === carrierId) {
						this.messageSvc
							.sendCarrierCommand({
								action: 'remove_carrier',
								carrierLabel: carrierId,
								logicalId: this.contextMenuObject.value.logicalId,
							})
							.subscribe()
					} else if (res.carrierId === '') {
						this.dialogSvc.alert({
							body: this.$t.instant('messages.confirmCarrierEmptyAtBuffer'),
						})
					} else {
						this.dialogSvc.alert({
							body: this.$t.instant('messages.confirmCarrierInvalid'),
						})
					}
				},
				(error) => {
					this.dialogSvc.alert({
						body: this.$t.instant('messages.confirmCarrierInvalid'),
					})
				},
			)
	}
	onInstallCarrier(carrierId: string) {
		this.tracksService
			.getCarrierInfo(this.contextMenuObject.value.logicalId)
			.subscribe(
				(res) => {
					if (res.carrierId === '') {
						this.messageSvc
							.sendCarrierCommand({
								action: 'install_carrier',
								carrierLabel: carrierId,
								logicalId: this.contextMenuObject.value.logicalId,
							})
							.subscribe()
					} else {
						this.dialogSvc.alert({
							body: this.$t.instant(
								'messages.confirmCarrierAlreadyExistAtBuffer',
							),
						})
					}
				},
				(error) => {
					this.dialogSvc.alert({
						body: this.$t.instant(
							'messages.confirmCarrierAlreadyExistAtBuffer',
						),
					})
				},
			)
	}

	onChangeSegmentProperty(isDisable: boolean) {
		if (isDisable) {
			this.messageSvc
				.sendDisableSegmentCommand(
					{ action: 'disable-segment' },
					this.contextMenuObject.value.id,
				)
				.subscribe()
		} else {
			this.messageSvc
				.sendDisableSegmentCommand(
					{ action: 'enable-segment' },
					this.contextMenuObject.value.id,
				)
				.subscribe()
		}
	}

	// point > home

	//NOTE: currently use in "id". change it with "logicalId" on demend
	homeAndGroupSelectList = this.trackStatusService.trackData.groups
		.map((g) => g.id)
		.map((e) => ({ id: e, value: `Group:${e}` }))

	onHomeValueChanged(event: { value: Number[] }) {
		this.contextMenuObject.value.home = event.value
	}
	onHomeSettingChanged(event: { value: boolean }) {
		this.homeActive = event.value
		// clear Point Context home when Home feature turns 'off'
		if (event.value === false && this.contextMenuObject.value.home.length > 0) {
			this.contextMenuObject.value.home = []
		}
	}

	onApplyPointHomeChange(id: number, homeGroups: number[]) {
		if (this.homeActive) {
			this.messageSvc.sendEnableHome(id, homeGroups).subscribe()
		} else {
			this.messageSvc.sendDisableHome(id).subscribe()
		}

		this.showContextMenu = false
		this.contextMenuObject = undefined
	}

	// EPIC > OMS-TRACK-MONITOR
	@HostListener('window:resize', ['$event.target'])
	onResize(window: Window) {
		this.viewerSetting.rect.width = window.innerWidth
		this.viewerSetting.rect.height = window.innerHeight - 40
	}

	public onCenterZoom() {
		this.viewer.centerZoom()
	}

	public findOnTM(event: { type: string; id: any }) {
		this.viewer.find(event.type, event.id)
	}
	public focusOnTM(event: { type: string; id: any }) {
		this.viewer.focus(event.type, event.id)
	}

	public trackOnTM(event: { type: string; id: any }) {
		this.viewer.track(event.type, event.id)
	}

	public onMouseoverTM(event: CustomEvent) {
		const payload = getCustomEventPayload(event)
		// @ts-ignore
		if (!(payload.type && payload.value && payload.event)) return

		// @ts-ignore
		const type = payload.type,
			// @ts-ignore
			object = payload.value

		switch (type.toUpperCase()) {
			case 'SEGMENT':
			case 'CLUSTER':
			case 'ZCU':
			case 'FIRESHUTTER':
				this.onTooltipOn(event)
				break
			case 'POINT':
			case 'MTL':
			case 'STATION':
			case 'BUFFER':
			case 'VEHICLE':
				// @ts-ignore
				if ((payload.event as MouseEvent).ctrlKey) {
					const pointId = (() => {
						switch (type.toUpperCase()) {
							case 'POINT':
								return object.id
							case 'MTL':
								return object.pointId
							case 'STATION':
								return object.pointId
							case 'BUFFER':
								return object.pointId
							case 'VEHICLE':
								return object.curPoint
						}
					})()
					// @ts-ignore
					this.mainColocatedObject = payload.value
					this.colocatedObjects =
						this.trackStatusService.getOverlapObjectOnPoint(pointId)
					this.onCoLocatedObjectPanelOn(event)
				} else {
					this.onTooltipOn(event)
				}
				break

			default:
				break
		}
	}

	public onCoLocatedObjectPanelOn(event: CustomEvent) {
		const payload = getCustomEventPayload(event)

		// @ts-ignore
		const { pageX: x, pageY: y } = payload.event

		const leftThreshold = window.innerWidth - 200
		const popupOffsetX = -50
		const popupOffsetY = 50

		const container = d3
			.select('#colocatedView')
			.style('top', `${y - popupOffsetY}px`)

		if (leftThreshold > x) {
			container.style('left', `${x + popupOffsetX}px`).style('right', 'inherit')
		} else {
			container
				.style('right', `${window.innerWidth - x + popupOffsetX}px`)
				.style('left', 'inherit')
		}

		this.showColocatedView = true
	}
	public onCoLocatedObjectPanelOff() {
		this.showColocatedView = false
	}

	public onFocusFromOverlapped(object: any) {
		this.selectedObject = object
		this.focusOnTM({ type: object.objectType, id: object.id })
	}
	public onContextMenuOnFromOverlapped(event: { object: any; event: Event }) {
		this.contextMenuObject = {
			type: event.object.objectType,
			value: event.object,
		}

		const leftThreshold = window.innerWidth - 200
		const popupOffsetX = 10
		const popupOffsetY = 40

		// @ts-ignore
		const { pageX: x, pageY: y } = event.event

		const container = d3
			.select('#contextMenu')
			.style('top', `${y - popupOffsetY}px`)

		if (leftThreshold > x) {
			container.style('left', `${x + popupOffsetX}px`).style('right', 'inherit')
		} else {
			container
				.style('right', `${window.innerWidth - x + popupOffsetX}px`)
				.style('left', 'inherit')
		}

		this.showContextMenu = true
	}

	public onTooltipOn(event: CustomEvent) {
		const payload = getCustomEventPayload(event)
		// @ts-ignore
		this.tooltipObject = { type: payload.type, value: payload.value }

		const groups =
			this.tooltipObject.type.toUpperCase() === 'POINT' &&
			this.tooltipObject.value.homeId
				? this.trackStatusService.getGroupsFromObject(
						'home',
						this.tooltipObject.value.homeId,
				  )
				: this.trackStatusService.getGroupsFromObject(
						this.tooltipObject.type,
						this.tooltipObject.value.id,
				  )
		this.tooltipObject.value.groups = groups

		if (this.tooltipObject.type === 'SEGMENT') {
			const { startPoint, endPoint } = this.tooltipObject.value
			this.tooltipObject.value.point =
				startPoint && endPoint ? `${startPoint} → ${endPoint}` : null
		}

		// @ts-ignore
		const { pageX: x, pageY: y } = payload.event

		const leftThreshold = window.innerWidth - 200
		const popupOffsetX = 10
		const popupOffsetY = 40

		const container = d3
			.select('#tooltipView')
			.style('top', `${y - popupOffsetY}px`)

		if (leftThreshold > x) {
			container.style('left', `${x + popupOffsetX}px`).style('right', 'inherit')
		} else {
			container
				.style('right', `${window.innerWidth - x + popupOffsetX}px`)
				.style('left', 'inherit')
		}

		this.showTooltip = true
	}
	public onMouseleaveTM(event: CustomEvent) {
		this.showTooltip = false
		this.tooltipObject = undefined
	}
	public onFocus(event: CustomEvent) {
		const payload = getCustomEventPayload(event)
		// @ts-ignore
		this.selectedObject = { objectType: payload.type, ...payload.value }
		// @ts-ignore
		this.focusOnTM({ type: payload.type, id: payload.value.id })
	}
	public async onContextMenuOn(event: CustomEvent) {
		const payload = getCustomEventPayload(event)
		// @ts-ignore
		if (!(payload.type && payload.value && payload.event)) return

		// @ts-ignore
		this.contextMenuObject = { type: payload.type, value: payload.value }

		if (this.contextMenuObject.type === 'POINT') {
			const homeId = (payload as any).value.homeId
			const homeGroups = this.trackStatusService.getGroupsFromObject(
				'HOME',
				homeId,
			)

			this.contextMenuObject.value.home = homeGroups
			this.homeActive = homeGroups.length > 0 && true
		}
		if (this.contextMenuObject.type === 'BUFFER') {
			const result = await this.tracksService
				.loadBufferById(this.contextMenuObject.value.id)
				.toPromise()
			Object.assign(this.contextMenuObject.value, result)
		}

		const leftThreshold = window.innerWidth - 200
		const popupOffsetX = 10
		const popupOffsetY = 40

		// @ts-ignore
		const { pageX: x, pageY: y } = payload.event

		const container = d3
			.select('#contextMenu')
			.style('top', `${y - popupOffsetY}px`)

		if (leftThreshold > x) {
			container.style('left', `${x + popupOffsetX}px`).style('right', 'inherit')
		} else {
			container
				.style('right', `${window.innerWidth - x + popupOffsetX}px`)
				.style('left', 'inherit')
		}

		this.showContextMenu = true
	}
	public onBackdrop(event: CustomEvent) {
		this.showContextMenu = false
		this.contextMenuObject = undefined
		this.selectedObject = undefined
		this.viewer.dropFocus()
		this.viewer.stopTrack()
	}
	public getCameraAndRotation() {
		const data = this.viewer.getCameraAndRotation()

		this.trackMonitorSettingService.update({
			key: 'rotation',
			value: data.rotation,
		})
		this.trackMonitorSettingService.update({
			key: 'viewBoxWidth',
			value: data.viewBox.width,
		})
		this.trackMonitorSettingService.update({
			key: 'position',
			value: data.position,
		})
	}
}

function getCustomEventPayload<T>(event: CustomEvent<T[]>) {
	return event.detail[0]
}
