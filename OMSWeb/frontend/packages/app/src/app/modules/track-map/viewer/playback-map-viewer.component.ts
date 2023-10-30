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

import {HostModeEnums, PermissionEnums, TscModeEnums} from '../../../models/enums'
import { IPreferences } from '../../../models/settings.model'
import { AuthService } from '../../../services/auth.service'

import '@daimre/oms-track-monitor'
import { IOmsTrackMonitor } from '@daimre/oms-track-monitor'
import { MapStatesService } from '../map-states.service'
import { SettingsService } from '@oms/root/services/settings.service'
import { TrackMonitorSettingService } from '../../../services/track-monitor-setting.service'
import d3 = require('d3')
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import {
  ClockChangedEvent,
  SegmentBlockingHistoryEvent,
  HistoryEvent,
  VehicleHistoryEvent,
  BufferHistoryEvent,
  StationHistoryEvent,
  ZcuHistoryEvent, PlaybackStation, CurrentStation,
} from '@oms/root/models/playback.model'
import {
	convertBufferHistoryEventToTmUpdateDtoBuffer,
	convertSegmentBlockingHistoryEventToTmUpdateDtoSegmentDisabled,
	convertSnapshotBufferToTmBuffer,
	convertSnapshotSegmentBlockingToTmUpdateDtoSegmentDisabled,
	convertSnapshotStationToTmStation,
	convertSnapshotVehicleToTmUpdateDtoVehicle,
	convertSnapshotZcuToTmZcu,
	convertStationHistoryEventToTmUpdateDtoStation,
	convertTrackBufferToTmBuffer,
	convertTrackMtlToTmMtl,
	convertTrackPointToTmPoint,
	convertTrackStationToTmStation,
	convertVehicleHistoryEventToTmUpdateDtoVehicle,
	convertZcuHistoryEventToTmUpdateDtoZcu,
} from '../../playback/utils/playback-convert.util'
import { SystemStatusService } from '@oms/root/services/system-status.service'
import { TranslateService } from '@ngx-translate/core'
import {
	HostSessionStatusEnums,
	OnOfflineModeEnums,
} from '../../../models/enums'
import {HubService} from "@oms/services/hub.service";
import {TrackStatusService} from "@oms/services/track-status.service";
import {Dto} from "@oms/models/dto/track.model";

@Component({
	selector: 'oms-playback-map-viewer',
	templateUrl: './playback-map-viewer.component.html',
	styleUrls: ['./playback-map-viewer.component.scss'],
})
export class PlaybackMapViewerComponent implements OnInit, OnDestroy {
	@Input() preference: IPreferences

	private viewer: IOmsTrackMonitor
	private destroy$: Subject<void> = new Subject<void>()
	public detailsVisible = false
	private cameraAndRotationSyncId
  onOffLine: boolean = false

  public nextLine = false
  public vhlAlias = null
  public includesWords  = []

	get tmSetting() {
		return this.trackMonitorSettingService.trackSetting
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
	public colocatedViewPosition:
		| { top: string; left: string; right: string }
		| undefined
	public colocatedObjects = []
	public mainColocatedObject: any
	public showColocatedView = false
	//history Panel
	public showHistoryPanel = true

	get showToolbarText(): boolean {
		return this.settingSvc.globalPreferences.toggles.showToolName
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

	get currentModeState() {
		return this.playService.currentModeState
	}
	get tscModeText(): string {
		const tscParam = this.playService.currentModeState.tsc_state
		return this.t$.instant(`enums.tscMode.${tscParam}`)
	}

  get hostModeText(): string {
    const hostMode = this.playService.currentModeState.control_state;
    return this.t$.instant((this.onOffLine? 'enums.hostModeRemote.' : 'enums.hostMode.')+`${hostMode}`);
  }
	get hostStatusIcon(): string {
    if (!this.isActiveConnStatus)
      return 'cloud_off'
    if(this.onOffLine){
      if (this.isActiveOnlineMode){
        if (this.isActiveHostMode) return 'cloud_done'
        return 'cloud'
      }
      return 'cloud_queue';
    }
    else {
      if (this.isActiveOnlineMode){
        return 'cloud_done'
      }
      return 'cloud_queue';
    }
	}

  get isActiveConnStatus(): boolean {
    const sessionStatus = this.playService.currentModeState.comm_state
    return sessionStatus % 1000 == HostSessionStatusEnums.CONNECTED;
  }

	constructor(
		private router: Router,
		private auth: AuthService,
		private mapStatesService: MapStatesService,
		private playService: PlaybackPlayService,
		private settingSvc: SettingsService,
		private trackMonitorSettingService: TrackMonitorSettingService,
		private systemStatusService: SystemStatusService,
		private t$: TranslateService,
    private hubService: HubService,
    private trackStatusService: TrackStatusService
	) {
    settingSvc.serviceConfig.subscribe(
      (config) => {
        this.onOffLine = config.onOffLine
        const fireStationFilters = config?.fireStationFilters
        this.includesWords = [
          ...fireStationFilters?.startWords,
          ...fireStationFilters?.endWords,
          ...fireStationFilters?.includeWords].filter(i=>i&&i)

        this.nextLine = config.nextLine
        this.vhlAlias = config.vhlAlias
      },
    )
  }

	hasPermissions(permissions: number[]): boolean {
		return this.auth.hasPermissions(permissions)
	}
	readonly permissionEnums: typeof PermissionEnums = PermissionEnums

	ngOnInit(): void {
    //this.hubService.stop()
		this.hubService.detachEventsOnMap()
		// @ts-ignore
		this.viewer = document.getElementById('playback-canvas')._instance.exposed

		this.setToCurrentSnapshot()

		this.cameraAndRotationSyncId = setInterval(() => {
			this.getCameraAndRotation()
		}, 500)
		this.viewer.setCameraAndRotation({
			position: this.tmSetting.position ?? {
				x: (this.playService.size.minX + this.playService.size.maxX) / 2,
				y: (this.playService.size.minY + this.playService.size.maxY) / 2,
			},
			viewBoxWidth: this.tmSetting.viewBoxWidth,
			rotation: this.tmSetting.rotation,
		})

		this.trackMonitorSettingService.rotationChanged.subscribe((rotation) =>
			this.viewer.setCameraAndRotation({ rotation }),
		)

		this.attachEvents()
	}
	ngOnDestroy(): void {
		this.destroy$.next()
		this.destroy$.complete()

		clearInterval(this.cameraAndRotationSyncId)
    this.hubService.start()

    this.trackStatusService.trackData.stations.map(s=>{
      if(!this.includeCheck(s.logicalId)) s.carrierId =null
    })

    this.viewer.setTrack({
      ...this.trackStatusService.trackData,
      segmentParts: this.trackStatusService.trackData.segments,
      segmentDisabled: this.trackStatusService.trackData.segmentDisabled,
      clusters: this.trackStatusService.trackData.clusters.map((c) => ({
        ...c,
        // @ts-ignore
        segments: c.segments.split(',').map((id) => parseInt(id.trim())),
      })),
    })

    this.trackStatusService.reloadMap()
	}

  get isHostOfflineMode(): boolean {
    const sessionStatus = this.playService.currentModeState.comm_state
    return sessionStatus == (HostSessionStatusEnums.CONNECTED + OnOfflineModeEnums.HostOffline * 1000) ||
      (sessionStatus == (OnOfflineModeEnums.HostOffline * 1000));
  }

  get isAttemptOnlineMode(): boolean {
    const sessionStatus = this.playService.currentModeState.comm_state
    return sessionStatus == (HostSessionStatusEnums.CONNECTED +OnOfflineModeEnums.AttemptOnline * 1000) ||
      sessionStatus == (OnOfflineModeEnums.AttemptOnline * 1000);
  }

  get onofflineModeText(): string {
    return this.t$.instant(
      (this.isActiveOnlineMode || this.isAttemptOnlineMode || this.isHostOfflineMode) ?
        `names.online` : `names.offline`)
  }

  get isActiveOnlineModeAndConn(): boolean {
    const sessionStatus = this.playService.currentModeState.comm_state
    return (sessionStatus == (HostSessionStatusEnums.CONNECTED + OnOfflineModeEnums.Online * 1000))
  }

  get isActiveHostMode(): boolean {
    const hostMode = this.playService.currentModeState.control_state
    return hostMode === HostModeEnums.HOST;
  }

  get isActiveOnlineMode(): boolean {
    const sessionStatus = this.playService.currentModeState.comm_state
    return (sessionStatus == (HostSessionStatusEnums.CONNECTED + OnOfflineModeEnums.Online * 1000)) ||
      (sessionStatus == ( OnOfflineModeEnums.Online * 1000));
  }

  get isActiveTscMode(): boolean {
    const tscMode = this.playService.currentModeState.tsc_state
    return tscMode === TscModeEnums.AUTO;
  }

	private setToCurrentSnapshot() {
		const points = (this.playService.track.data.points ?? []).map(
			convertTrackPointToTmPoint,
		)
		const segmentParts = (this.playService.track.data.segment_parts ?? []).map(
			(sp) => {
				const segment = (this.playService.track.data.segments ?? []).find(
					(s) => s.id === sp.segment_id,
				)

				return {
					id: segment.id,
					logicalId: segment.logical_id,
					physicalId: segment.physical_id,
					startPoint: segment.start_point,
					endPoint: segment.end_point,
					length: segment.length,
					speed: segment.speed,

					segpartId: sp.id,
					type: sp.type,
					location: sp.location,
					direction: sp.direction,
				}
			},
		)
		const buffers = this.playService.currentSnapshot.data.buffers
			? this.playService.currentSnapshot.data.buffers.map(
					convertSnapshotBufferToTmBuffer,
			  )
			: this.playService.track.data.buffers
			? this.playService.track.data.buffers.map(convertTrackBufferToTmBuffer)
			: []


		let stations: CurrentStation[] = this.playService.currentSnapshot.data.stations
			? this.playService.currentSnapshot.data.stations.map(
					convertSnapshotStationToTmStation,
			  )
			: this.playService.track.data.stations
			? this.playService.track.data.stations.map(convertTrackStationToTmStation)
			: []
		const zcus = this.playService.currentSnapshot.data.zcus
			? this.playService.currentSnapshot.data.zcus.map(
					convertSnapshotZcuToTmZcu,
			  )
			: []

		const mtls = (this.playService.track.data.mtls ?? []).map(
			convertTrackMtlToTmMtl,
		)
		const vehicles = []
		let segmentDisabled = []

    stations.map(s=>{
      if(!this.includeCheck(s?.logicalId)) s.carrierId =null
    })

		// @ts-ignore
		this.viewer.setTrack({
			points,
			segmentParts,
			buffers,
			stations,
			mtls,
			vehicles,
			segmentDisabled,
			zcus,
		})


		// make other task
		setTimeout(() => {
			const vehicles = this.playService.currentSnapshot.data.vehicles ?? []
			vehicles.forEach((v) => {
				this.viewer.updateVehicle(
					'INSERT',
					convertSnapshotVehicleToTmUpdateDtoVehicle(
						v,
						this.playService.currentOrders,
					),
				)
			})

      segmentDisabled =
				this.playService.currentSnapshot.data.segment_blocking ?? []
      segmentDisabled.forEach((sb) => {
				this.viewer.updateSegmentDisabled(
					'INSERT',
					convertSnapshotSegmentBlockingToTmUpdateDtoSegmentDisabled(
						'INSERT',
						sb,
					),
				)
			})
		}, 1)
	}

	private applyEvents(events: HistoryEvent[]) {
		this.setToCurrentSnapshot()
		setTimeout(() => this.consumeEvents(events), 2)
	}

	private consumeEvents(events: HistoryEvent[]) {
		events.forEach((event) => {
			switch (event.tableName) {
				case 'vehicle_history':
					this.applyVehicleHistoryEvent(event)
					break
				case 'segment_blocking_history':
					this.applySegmentBlockingHistoryEvent(event)
					break
				case 'buffer_history':
					this.applyBufferHistoryEvent(event)
					break
				case 'station_history':
					this.applyStationHistoryEvent(event)
					break
				case 'zcu_history':
					this.applyZcuHistoryEvent(event)
					break

				default:
					break
			}
		})
	}
	private applyVehicleHistoryEvent(event: VehicleHistoryEvent) {
		this.viewer.updateVehicle(
			event.historyChangeType,
			convertVehicleHistoryEventToTmUpdateDtoVehicle(
				event,
				this.playService.currentOrders,
			),
		)
	}
	private applySegmentBlockingHistoryEvent(event: SegmentBlockingHistoryEvent) {
		this.viewer.updateSegmentDisabled(
			event.historyChangeType,
			convertSegmentBlockingHistoryEventToTmUpdateDtoSegmentDisabled(event),
		)
	}
	private applyBufferHistoryEvent(event: BufferHistoryEvent) {
		this.viewer.updateBuffer(
			event.historyChangeType,
			convertBufferHistoryEventToTmUpdateDtoBuffer(event),
		)
	}
	private applyStationHistoryEvent(event: StationHistoryEvent) {
		let s =convertStationHistoryEventToTmUpdateDtoStation(event)
		if(!this.includeCheck(event.logicalId)) s.carrierId =null
		this.viewer.updateStation(
			event.historyChangeType,
			s,
		)
	}
	private applyZcuHistoryEvent(event: ZcuHistoryEvent) {
		this.viewer.updateZcu(
			event.historyChangeType,
			convertZcuHistoryEventToTmUpdateDtoZcu(event),
		)
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

		this.mapStatesService.statusTableResizeEvent$
			.pipe(takeUntil(this.destroy$))
			.subscribe((tableHeightNum) => {
				this.viewerSetting.rect.height =
					window.innerHeight -
					40 -
					(tableHeightNum === 0 ? 0 : tableHeightNum + 50)
			})

		this.auth.certUpdated$.pipe(takeUntil(this.destroy$)).subscribe((cert) => {
			this.router.navigateByUrl('/', { skipLocationChange: false }).then(() => {
				this.router.navigate([cert ? '/monitor/status' : '/'])
			})
		})

		this.playService.clockChanged.subscribe((event: ClockChangedEvent) => {
			switch (event.type) {
				case 'SnapshotChanged':
					this.setToCurrentSnapshot()
					break
				case 'EventsChanged':
					this.applyEvents(event.events)
					break
				case 'NextFrameEvent':
					this.consumeEvents(event.events)
					break

				default:
					break
			}
		})
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
	public stateOnTM(event: boolean) {
		if (event === true) {
			this.showHistoryPanel = !this.showHistoryPanel
		}
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
						this.playService.getOverlapObjectOnPoint(pointId)
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
	public onContextMenuOn(event: CustomEvent) {}
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
    return this.includesWords.some(i=>word.includes(i))
  }
}

function getCustomEventPayload<T>(event: CustomEvent<T[]>) {
	return event.detail[0]
}
