import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit,} from '@angular/core'
import {Router} from '@angular/router'
import {Subject} from 'rxjs'
import {takeUntil} from 'rxjs/operators'

import {IdType, PermissionEnums, PointType, ViewModes} from '../../../models/enums'
import {Dto} from '../../../models/dto/track.model'
import {IPreferences} from '../../../models/settings.model'
import {HubService} from '../../../services/hub.service'
import {IDataChangeEvent} from '../../../models/notification.model'
import {AuthService} from '../../../services/auth.service'

import '@synusdev/oms-track-monitor'
import { IOmsTrackMonitor, } from '@synusdev/oms-track-monitor'
import {StatusService} from '@oms/root/services/status.service'
import {MapStatesService} from '../map-states.service'
import {SettingsService} from '@oms/root/services/settings.service'
import {TrackStatusService} from '../../../services/track-status.service'
import {TrackMonitorSettingService} from '../../../services/track-monitor-setting.service'
import {TranslateService} from '@ngx-translate/core'
import {MessagesService} from '@oms/root/services/messages.service'
import {DialogService} from '@oms/root/services/dialog.service'
import {IVehicleCommandMessage} from '@oms/root/models/command.model'
import {SystemStatusService} from '@oms/root/services/system-status.service'
import {TracksService} from '@oms/root/services/tracks.service'
import {TransfersService} from '@oms/root/services/transfers.service'
import {VehicleStatusDialogService} from '@oms/root/services/vehicle-status-dialog.service'
import {BufferStatusDialogService} from '@oms/root/services/buffer-status-dialog.service'
import d3 = require('d3');
import {MobileService} from "../../../services/mobile.service";

@Component({
	selector: 'oms-map-viewer',
	templateUrl: './map-viewer.component.html',
	styleUrls: ['./map-viewer.component.scss'],
})
export class MapViewerComponent implements OnInit, OnDestroy {
	@Input() preference: IPreferences
	@Input() viewMode: ViewModes
	@Input() trackData: Dto.ITrackData
	@Input() findEvent: EventEmitter<{ type: string; id: number }>
	@Input() focusEvent: EventEmitter<{
		type: string
		id: number
		focusType?: string
	}>
	@Input() dropFocusEvent: EventEmitter<{ focusType?: string }>

	private viewer: IOmsTrackMonitor
	private destroy$: Subject<void> = new Subject<void>()
	public detailsVisible = false

	private cameraAndRotationSyncId

  public firstLoad = true;

  disableHWZCU = false
	get tmSetting() {
		return this.trackMonitorSettingService.trackSetting
	}

	// no one used
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
	public contextMenuObject: { type: string; value: any; controlKey?: boolean } | undefined
	public showContextMenu = false
	public homeActive = false
  public nextLine = false
  public vhlAlias = null

	public colocatedViewPosition:
		| { top: string; left: string; right: string }
		| undefined
	public colocatedObjects = []
	public mainColocatedObject: any
	public showColocatedView = false
  public includesWords  = []

	get activeDetails(): boolean {
		return this.detailsVisible && this.auth.isAuthenticated
	}
	get showToolbarText(): boolean {
		return this.settingSvc.globalPreferences.toggles.showToolName || this.mobileSvc.isMobile
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
		private transferSvc: TransfersService,
		private messageSvc: MessagesService,
		private dialogSvc: DialogService,
		private $t: TranslateService,
		private systemStatusService: SystemStatusService,
		private vehicleStatusDialogService: VehicleStatusDialogService,
		private bufferStatusDialogService: BufferStatusDialogService,
    private transfersService: TransfersService,
    private mobileSvc: MobileService,
	) {
		this.auth.certUpdated$.pipe(takeUntil(this.destroy$)).subscribe((cert) => {
			this.router.navigateByUrl('/', { skipLocationChange: false }).then(() => {
        const url =  mobileSvc.isMobile ? '/mobile/status' : '/monitor/status'
				this.router.navigate([cert ? url : '/'])
			})
		})

    settingSvc.serviceConfig.subscribe(
      (config) => {
        const fireStationFilters = config?.fireStationFilters
        this.includesWords = [
          ...fireStationFilters?.startWords,
          ...fireStationFilters?.endWords,
          ...fireStationFilters?.includeWords].filter(i=>i&&i)
        this.disableHWZCU = config?.disableHWZCU
      },
    )
	}

	hasPermissions(permissions: number[]): boolean {
		return this.auth.hasPermissions(permissions)
	}
	readonly permissionEnums: typeof PermissionEnums = PermissionEnums

	isZcuWithFireshutter(id: number) {
		return this.systemStatusService.zcusWithFireshutter.includes(id)
	}

	ngOnInit(): void {
    if(this.firstLoad){
      this.statusService.getVehicles().subscribe((res) => {
        if (res?.vehicles) {
          res.vehicles.forEach((v) =>
            this.viewer.updateVehicle('UPDATE', v),
          )
        }
      })
      this.firstLoad =false
    }
		// @ts-ignore
		this.viewer = document.getElementById('track-canvas')._instance.exposed

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

    this.settingSvc.serviceConfig.subscribe(
      (config) => {
        this.nextLine = config.nextLine
        this.vhlAlias = config.vhlAlias
      },
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

		this.findEvent.subscribe((event: { type: string; id: number }) => {
			this.findOnTM(event)
		})

    this.focusEvent.subscribe(
      (event: { type: string; id: number; focusType?: string }) => {
        console.log("map-viewer focusEvent event=" + JSON.stringify(event));
				this.focusOnTM(event)
			},
		)
		this.dropFocusEvent.subscribe((event: { focusType?: string }) => {
			this.dropFocusOnTM(event)
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
					this.viewer.updateVehicle(e.operation, e.data)
				})
			this.hubSvc.segmentChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((e: IDataChangeEvent) => {
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
				.subscribe((e: any) => {
					this.viewer.updateStation(e.operation, {
						id: e.id,
						unuse: e.unuse,
            state: e?.data.state,
						user: e?.user,
						note: e?.note,
            carrierId: e?.carrierId,
            cAlias: e?.data.cAlias
					})
				})

			this.hubSvc.bufferChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((e: any) => {
					this.viewer.updateBuffer(e.operation, {
						id: e.id,
						unuse: e.unuse,
            state: e?.data.state,
						carrierId: e.carrierId,
						user: e?.user,
						note: e?.note,
            cAlias: e?.data.cAlias,
            type: e?.data?.type,
					})
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

			this.hubSvc.mtlChanged$.pipe(takeUntil(this.destroy$)).subscribe((e) => {
				this.viewer.updateMtl(e.operation, e.data)
			})

			this.hubSvc.clusterStatusChanged$
				.pipe(takeUntil(this.destroy$))
				.subscribe((e) => {
					this.viewer.updateClusterState(e.operation, {
						id: e.id, // server id
						converterId: e.converterId,
						status: e.status,
						backupId: e.backupId,
					})
				})

      this.hubSvc.clusterChanged$
        .pipe(takeUntil(this.destroy$))
        .subscribe((e) => {
          this.viewer.updateClusters(e.operation, {
            id: e.id, // server id
            color: e.color,
            logicalId: e.logicalId,
            maxVehicles: e.maxVehicles
          })
        })
		}
	}

	changeFocus(event: any) {
		this.selectedObject = event
		// @ts-ignore
		this.focusOnTM({ type: event.objectType, id: event.id })
	}

	onToggleStationUnuse(id: number, toState: 'UNUSE' | 'USE') {
		if (toState === 'UNUSE') {
			this.dialogSvc
				.verify({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((ok) => {
					if (ok) {
						const { operator, reason } = ok
						const message = {
							type: 'UNUSE',
							action: 'station-setting',
							unused: 1,
							user: operator,
							note: reason,
						}
						this.messageSvc.sendStationSettingCommand(message, [id]).subscribe()
						this.showContextMenu = false
            this.contextMenuObject = undefined
					}
				})
		} else if (toState === 'USE') {
			this.dialogSvc
				.confirm({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((ok) => {
					if (ok) {
						const message = {
							type: 'USE',
							action: 'station-setting',
							unused: 0,
						}
						this.messageSvc.sendStationSettingCommand(message, [id]).subscribe()
						this.showContextMenu = false
            this.contextMenuObject = undefined
					}
				})
		}
	}

	onToggleBufferUnuse(id: number, toState: 'UNUSE' | 'USE') {
		if (toState === 'UNUSE') {
			this.dialogSvc
				.verify({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((ok) => {
					if (ok) {
						const { operator, reason } = ok
						const message = {
							type: 'UNUSE',
							action: 'buffer-setting',
							unused: 1,
							user: operator,
							note: reason,
						}
						this.messageSvc.sendBufferSettingCommand(message, [id]).subscribe()
						this.showContextMenu = false
            this.contextMenuObject = undefined
					}
				})
		} else if (toState === 'USE') {
			this.dialogSvc
				.confirm({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((ok) => {
					if (ok) {
						const message = { type: 'USE', action: 'buffer-setting', unused: 0 }
						this.messageSvc.sendBufferSettingCommand(message, [id]).subscribe()
						this.showContextMenu = false
            this.contextMenuObject = undefined
					}
				})
		}
	}

	onVehicleStatusDialogOpen() {
		if (this.contextMenuObject == null) return

		this.vehicleStatusDialogService.setSelectedVehicle(
			this.contextMenuObject.value,
		)
		this.vehicleStatusDialogService.openVehicleStatusDialog()
		this.showContextMenu = false
    this.contextMenuObject = undefined
	}

	onVehicleCommand(name: string) {
		let commandMessage: IVehicleCommandMessage
		let needConfirm: boolean = false
		let needVerify: boolean = false

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
			case 'push:disable':
				commandMessage = { action: 'set_behavior', canBePushed: false }
				break
			case 'hostOrder:enable':
				commandMessage = { action: 'set_behavior', hostOrder: true }
				break
			case 'hostOrder:disable':
				commandMessage = { action: 'set_behavior', hostOrder: false }
				needVerify = true
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
          this.showContextMenu =false;
				})
		} else if (needVerify) {
			this.dialogSvc
				.verify({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((ok) => {
					if (ok) {
						const { operator, reason } = ok
						commandMessage.user = operator
						commandMessage.note = reason

						this.messageSvc
							.sendVehicleCommand(commandMessage, [
								this.contextMenuObject.value,
							])
							.subscribe()
            this.showContextMenu =false;
					}
				})
		} else {
			this.messageSvc
				.sendVehicleCommand(commandMessage, [this.contextMenuObject.value])
				.subscribe()
      this.showContextMenu =false;
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
						.subscribe(()=>this.showContextMenu =false)
				} else {
					this.contextMenuObject.value.usingType = origin
				}
			})
	}
  onResetZcu() {
    const type = this.contextMenuObject.value?.usingType===1? 'hw' : 'sw'
		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmZcuReset') })
			.subscribe((confirm) => {
				if (confirm) {
					this.messageSvc
						.sendZcuCommand({
							action: 'zcu_reset',
							zcuId: this.contextMenuObject.value.id,
              zcuUsingType: type
						})
						.subscribe(()=>this.showContextMenu =false)
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
    this.showContextMenu =false
	}
	onSetDest(objectType) {
		const { id, logicalId, physicalId } = this.contextMenuObject.value
		this.mapStatesService.transferCommandState.dest = {
			objectType,
			id,
			logicalId,
			physicalId,
		}
    this.showContextMenu =false
	}
	onRemoveCarrier(carrierId: string) {
    if(!carrierId) return;
		this.transferSvc
			.checkCarrierChange(
				'remove',
				this.contextMenuObject.value.logicalId,
				'buffer',
				carrierId,
				'none',
			)
			.subscribe((res) => {
				console.log(res)

				if (res.hcack === 0 || res.hcack === 4) {
					this.messageSvc
						.sendCarrierCommand({
							action: 'remove_carrier',
							carrierLabel: carrierId,
							logicalId: this.contextMenuObject.value.logicalId,
						})
						.subscribe()

					this.dialogSvc.success({
						title: this.$t.instant('names.success'),
						body: this.$t.instant('messages.confirmSuccessRemoveCarrier'),
					}).subscribe(()=>this.showContextMenu =false)
				} else {
					var errorMessage = ''
					if (res.hcack === 2) errorMessage = 'messages.confirmNotAbleToExcute'
					else if (res.hcack === 3) {
						if (res.cpname === 'CARRIERID')
							errorMessage = 'messages.confirmParameterInvalidCarrierID'
						else if (res.cpname === 'CARRIERLOC')
							errorMessage = 'messages.confirmParameterInvalidCarrierLoc'
						else errorMessage = 'messages.confirmParameterInvalid'
					} else if (res.hcack === 5) errorMessage = 'messages.confirmReject'
					else errorMessage = 'messages.confirmNotAbleToExcute'

					this.dialogSvc.alert({
						title: this.$t.instant('names.failed'),
						body: this.$t.instant(errorMessage),
					})
				}
			})
	}
	onInstallCarrier(carrierId: string) {
		this.transferSvc
			.checkCarrierChange(
				'install',
				this.contextMenuObject.value.logicalId,
				'buffer',
				carrierId,
				'none',
			)
			.subscribe((res) => {
				console.log(res)

				if (res.hcack === 0 || res.hcack === 4) {
					this.messageSvc
						.sendCarrierCommand({
							action: 'install_carrier',
							carrierLabel: carrierId,
							logicalId: this.contextMenuObject.value.logicalId,
						})
						.subscribe()

					this.dialogSvc.success({
						title: this.$t.instant('names.success'),
						body: this.$t.instant('messages.confirmSuccessInstallCarrier'),
					}).subscribe(()=> {
            this.showContextMenu = false
            this.contextMenuObject =undefined
          })
				} else {
					var errorMessage = ''
					if (res.hcack === 2) errorMessage = 'messages.confirmNotAbleToExcute'
					else if (res.hcack === 3) {
						if (res.cpname === 'CARRIERID')
							errorMessage = 'messages.confirmParameterInvalidCarrierID'
						else if (res.cpname === 'CARRIERLOC')
							errorMessage = 'messages.confirmParameterInvalidCarrierLoc'
						else errorMessage = 'messages.confirmParameterInvalid'
					} else if (res.hcack === 5) errorMessage = 'messages.confirmReject'
					else errorMessage = 'messages.confirmNotAbleToExcute'

					this.dialogSvc.alert({
						title: this.$t.instant('names.failed'),
						body: this.$t.instant(errorMessage),
					})
				}
			})
	}

	onChangeSegmentProperty(isDisable: boolean) {
		if (isDisable) {
			this.dialogSvc
				.verify({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((ok) => {
					if (ok) {
						const { operator, reason } = ok
						this.messageSvc
							.sendDisableSegmentCommand(
								{ action: 'disable-segment', user: operator, note: reason },
								this.contextMenuObject.value.id,
							)
							.subscribe()

						this.showContextMenu = false
						this.contextMenuObject = undefined
					}
				})
		} else {
			this.messageSvc
				.sendDisableSegmentCommand(
					{ action: 'enable-segment' },
					this.contextMenuObject.value.id,
				)
				.subscribe()

      this.showContextMenu = false
      this.contextMenuObject = undefined
    }
	}

  onChangeSegmentByVHL(isDisable: boolean) {
    if (!isDisable) {
      this.messageSvc
        .sendEnableSegmentCommand(
          { action: 'enable-segment'},
          this.contextMenuObject.value.id,
        )
        .subscribe()

      this.showContextMenu = false
      this.contextMenuObject = undefined
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
		if (event.value === false && this.contextMenuObject.value.home?.length > 0) {
			this.contextMenuObject.value.home = []
		}
	}

	onApplyPointHomeChange(id: number, homeGroups: number[]) {
		if (this.homeActive) {
			this.tracksService.checkPointHomeInterlock(id).subscribe((res) => {
				if (res.retcode === 0) {
					this.messageSvc.sendEnableHome(id, homeGroups).subscribe()
				} else {
					this.dialogSvc.alert({
						title: this.$t.instant('names.failed'),
						body: this.$t.instant('messages.confirmPointHomeInterlock'),
					})
				}
			})
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
  public focusOnTM(event: { type: string; id: any; focusType?: string }) {
    console.log("map-viewer.component focustOnTM");
		this.viewer.focus(event.type, event.id, event.focusType)
	}
	public dropFocusOnTM(event: { focusType?: string }) {
		this.viewer.dropFocus(event.focusType)
	}

	public trackOnTM(event: { type: string; id: any }) {
		this.viewer.track(event.type, event.id)
	}

  public onMouseoverTM(event: CustomEvent) {
    console.log("map-viewer.component onMouseoverTM");
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
				if ((payload.event as MouseEvent).ctrlKey || !this.preference.toggles.ctrlKey) {
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
		this.handleAfterFocus(object)
	}
	public onContextMenuOnFromOverlapped(event: { object: any; event: Event }) {
		this.contextMenuObject = {
			type: event.object.objectType,
			value: event.object,
		}

    if (this.contextMenuObject.type.toUpperCase() === 'POINT') {
      const homeId = this.contextMenuObject.value.homeId
      const homeGroups = this.trackStatusService.getGroupsFromObject(
        'HOME',
        homeId,
      )

      this.contextMenuObject.value.home = homeGroups
      this.homeActive = !!homeId
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

      const { startPointDto, endPointDto } = this.tooltipObject.value
      const { startPoint, endPoint } = this.tooltipObject.value

      const pd =this.preference.trackDisplay.pointDisplay;
      if(pd === PointType.BCR){
        this.tooltipObject.value.point =
          startPointDto && endPointDto ? `${startPointDto.physicalId} → ${endPointDto.physicalId}` : null
      }
      else if(pd === PointType.ID_BCR){
        this.tooltipObject.value.point =
          startPointDto && endPointDto && startPoint && endPoint ?
            `${startPoint}(${startPointDto.physicalId}) → ${endPoint}(${endPointDto.physicalId})` : null
      }
      else{
        this.tooltipObject.value.point =
          startPoint && endPoint ? `${startPoint} → ${endPoint}` : null
      }
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
    console.log("########################onFocus:: CustomEvent 2");
    console.log("onFocus:: CustomEvent=" + JSON.stringify(event));

		const payload = getCustomEventPayload(event)
		// @ts-ignore
    this.selectedObject = { objectType: payload.type, ...payload.value }

		// @ts-ignore
		this.focusOnTM({ type: payload.type, id: payload.value.id })
    console.log("onFocus:: payload?=" + JSON.stringify(payload));
		// @ts-ignore
		this.handleAfterFocus(payload.value)
	}
	private handleAfterFocus(object: any) {
		const objectType = this.selectedObject.objectType.toLowerCase()
    console.log("handleAfterFocus IN");
		if (objectType === 'vehicle') {
			const vhl = object

			// for vehicle status dialog
			this.vehicleStatusDialogService.setSelectedVehicle(vhl)

			// for manual transfer dialog
			const transferCommandState = this.mapStatesService.transferCommandState
			if (transferCommandState.active) {
				const isCategoryFromRelated =
					transferCommandState.category === 'fromTo' ||
					transferCommandState.category === 'from'

				if (
					(isCategoryFromRelated && transferCommandState.selectVehicle) ||
					!isCategoryFromRelated
          || (transferCommandState.category==='scan' && transferCommandState.selectVehicle)
				)
					this.mapStatesService.transferCommandState.vehicle = {
						objectType: 'Vehicle',
						id: vhl.id,
						logicalId: vhl.logicalId,
						physicalId: vhl.physicalId,
					}
			}
		} else if (objectType === 'buffer' || objectType === 'station') {
			// buffer status dialog section start
			if (objectType === 'buffer')
				this.bufferStatusDialogService.setSelectedBuffer(object)
			// buffer status dialog section end
			// manual transfer section start
			const port = { objectType, ...object }
			const transferCommandState = this.mapStatesService.transferCommandState
			if (transferCommandState.active === false) return

			switch (transferCommandState.category) {
				case 'fromTo':
					{
						if (transferCommandState.source == null)
							this.mapStatesService.transferCommandState.source = port
						else this.mapStatesService.transferCommandState.dest = port
					}
					break
				case 'from':
					{
						this.mapStatesService.transferCommandState.source = port
            if(objectType === 'buffer'){
              setTimeout(()=>{
                const { carrier } = this.mapStatesService.transferCommandState
                if(!carrier){
                  this.dialogSvc.alert({
                    title: this.$t.instant('names.blocked'),
                    body: this.$t.instant('messages.confirmParameterInvalid'),
                  })
                }
              }, 500)
            }
					}
					break
				case 'to':
					{
						this.mapStatesService.transferCommandState.dest = port
					}
					break
				case 'move':
					{
						this.mapStatesService.transferCommandState.dest = port
					}
					break
				case 'mtl':
					{
						// nothing
					}
					break
        case 'scan':
        {
          if (objectType === 'buffer'){
            const i = this.mapStatesService.transferCommandState.buffers.findIndex(item=>item.id===port.id)
            i===-1 && this.mapStatesService.transferCommandState.buffers.push(port)
          }
        }
          break
				default:
					break
			}
			// manual transfer section end
    } else if (objectType === 'point') {
      console.log("handleAfterFocus objectType Point!");
			const point = { objectType, ...object }
      const transferCommandState = this.mapStatesService.transferCommandState
      console.log("handleAfterFocus objectType Point transferCommandState" + JSON.stringify(transferCommandState));
			if (transferCommandState.active === false) return

			switch (transferCommandState.category) {
				case 'fromTo':
					{
						// nothing
					}
					break
				case 'from':
					{
						// nothing
					}
					break
				case 'to':
					{
						// nothing
					}
					break
				case 'move':
					{
						this.mapStatesService.transferCommandState.dest = point
					}
					break
				case 'mtl':
					{
						// nothing
					}
					break
				default:
					break
			}
		} else if (objectType === 'mtl'){
      const point = { objectType, ...object }
      const transferCommandState = this.mapStatesService.transferCommandState
      if (transferCommandState.active === false) return

      switch (transferCommandState.category) {
        case 'fromTo':
        {
          // nothing
        }
          break
        case 'from':
        {
          // nothing
        }
          break
        case 'to':
        {
          // nothing
        }
          break
        case 'move':
        {
          // nothing
        }
          break
        case 'mtl':
        {
          // nothing
        }
          break
        default:
          break
      }
    }
	}
	public async onContextMenuOn(event: CustomEvent) {
    //if(this.mapStatesService.transferCommandState.active) return
		const payload = getCustomEventPayload(event)
		// @ts-ignore
		if (!(payload.type && payload.value && payload.event)) return

		// @ts-ignore
		this.contextMenuObject = { type: payload.type, value: payload.value, controlKey: false }

    // @ts-ignore
    if((payload.event as MouseEvent).ctrlKey){
      this.contextMenuObject.controlKey = true
    }

		if (this.contextMenuObject.type === 'POINT') {
			const homeId = (payload as any).value.homeId
			const homeGroups = this.trackStatusService.getGroupsFromObject(
				'HOME',
				homeId,
			)

			this.contextMenuObject.value.home = homeGroups
			this.homeActive = !!homeId
		}
		if (this.contextMenuObject.type === 'BUFFER' ) {
			const result = await this.tracksService
				.loadBufferById(this.contextMenuObject.value.id)
				.toPromise()

      this.contextMenuObject?.value && Object.assign(this.contextMenuObject.value, result)
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

  includeCheck(word: string){
    if(!this.showContextMenu) return false;
    return this.includesWords.some(i=>word.includes(i))
  }

  onRemoveCarrierStation(carrierId: string) {
    if(!carrierId) return;
    if(!this.includeCheck(this.contextMenuObject?.value?.logicalId)){
      this.dialogSvc.alert({
        title: this.$t.instant('names.failed'),
        body: this.$t.instant('messages.confirmNotAbleToExcute'),
      })
    }

    this.transferSvc
      .checkCarrierChange(
        'remove',
        this.contextMenuObject.value.logicalId,
        'station',
        carrierId,
        'none',
      )
      .subscribe((res) => {
        if (res.hcack === 0 || res.hcack === 4) {
          this.messageSvc
            .sendCarrierCommand({
              action: 'remove_carrier',
              carrierLabel: carrierId,
              logicalId: this.contextMenuObject.value.logicalId,
            })
            .subscribe()

          this.dialogSvc.success({
            title: this.$t.instant('names.success'),
            body: this.$t.instant('messages.confirmSuccessRemoveCarrier'),
          }).subscribe(()=>this.showContextMenu =false)
        } else {
          let errorMessage = ''
          if (res.hcack === 2) errorMessage = 'messages.confirmNotAbleToExcute'
          else if (res.hcack === 3) {
            if (res.cpname === 'CARRIERID')
              errorMessage = 'messages.confirmParameterInvalidCarrierID'
            else if (res.cpname === 'CARRIERLOC')
              errorMessage = 'messages.confirmParameterInvalidCarrierLoc'
            else errorMessage = 'messages.confirmParameterInvalid'
          } else if (res.hcack === 5) errorMessage = 'messages.confirmReject'
          else errorMessage = 'messages.confirmNotAbleToExcute'

          this.dialogSvc.alert({
            title: this.$t.instant('names.failed'),
            body: this.$t.instant(errorMessage),
          })
        }
      })
  }

  isHiddenTypeZcu(usingType=1){
    if(!this.disableHWZCU) return false
    const type = usingType !== 1
    return this.disableHWZCU&&type
  }

  labelDisplayTable(type: string): string {
    return this.preference.controlTables[type]
  }

  getDisplayTableLabel(order: string, type: string): string {
    return this.preference.controlTables[order].find(
      (column) => column.name === type,
    )?.i18nLabel
  }
}

function getCustomEventPayload<T>(event: CustomEvent<T[]>) {
  console.log("map-viewer.component getCustomEventPayload");
	return event.detail[0]
}
