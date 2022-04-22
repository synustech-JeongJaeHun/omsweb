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

import { PermissionEnums } from '../../../models/enums'
import { IPreferences } from '../../../models/settings.model'
import { AuthService } from '../../../services/auth.service'

import '@daimre/oms-track-monitor'
import {
	OmsTrackMonitorElement,
	IOmsTrackMonitor,
} from '@daimre/oms-track-monitor'
import { MapStatesService } from '../map-states.service'
import { SettingsService } from '@oms/root/services/settings.service'
import { TrackMonitorSettingService } from '../../../services/track-monitor-setting.service'
import d3 = require('d3')
import { TranslateService } from '@ngx-translate/core'
import { DialogService } from '@oms/root/services/dialog.service'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import {
	ClockChangedEvent,
	OrderHistoryEvent,
	SegmentBlockingHistoryEvent,
	TimelineEvent,
	VehicleHistoryEvent,
} from '@oms/root/models/playback.model'
import {
	convertSegmentBlockingHistoryEventToTmUpdateDtoSegmentDisabled,
	convertSnapshotSegmentBlockingToTmUpdateDtoSegmentDisabled,
	convertSnapshotVehicleToTmUpdateDtoVehicle,
	convertTrackBufferToTmBuffer,
	convertTrackMtlToTmMtl,
	convertTrackPointToTmPoint,
	convertTrackStationToTmStation,
	convertVehicleHistoryEventToTmUpdateDtoVehicle,
} from '../../playback/utils/playback-convert.util'

@Component({
	selector: 'oms-legacy-map-viewer',
	templateUrl: './legacy-map-viewer.component.html',
	styleUrls: ['./legacy-map-viewer.component.scss'],
})
export class LegacyMapViewerComponent implements OnInit, OnDestroy {
	@Input() preference: IPreferences

	private viewer: IOmsTrackMonitor
	private destroy$: Subject<void> = new Subject<void>()

	public detailsVisible = false

	private cameraAndRotationSyncId

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

	get activeDetails(): boolean {
		return this.detailsVisible && this.auth.isAuthenticated
	}
	get showToolbarText(): boolean {
		return this.settingSvc.globalPreferences.toggles.showToolName
	}

	constructor(
		private router: Router,
		private auth: AuthService,
		private mapStatesService: MapStatesService,
		private playService: PlaybackPlayService,
		private settingSvc: SettingsService,
		private trackMonitorSettingService: TrackMonitorSettingService,
		private dialogSvc: DialogService,
		private $t: TranslateService,
		private dialog: MatDialog,
	) {}

	hasPermissions(permissions: number[]): boolean {
		return this.auth.hasPermissions(permissions)
	}
	readonly permissionEnums: typeof PermissionEnums = PermissionEnums

	ngOnInit(): void {
		// @ts-ignore
		this.viewer = document.getElementById('track-canvas')._instance.exposed

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
	}

	private setToCurrentSnapshot() {
		// @ts-ignore
		this.viewer.setTrack({
			points: (this.playService.track.data.points ?? []).map(
				convertTrackPointToTmPoint,
			),

			segmentParts: (this.playService.track.data.segment_parts ?? []).map(
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
			),
			buffers: (this.playService.track.data.buffers ?? []).map(
				convertTrackBufferToTmBuffer,
			),
			stations: (this.playService.track.data.stations ?? []).map(
				convertTrackStationToTmStation,
			),
			mtls: (this.playService.track.data.mtls ?? []).map(
				convertTrackMtlToTmMtl,
			),
			vehicles: [],
			segmentDisabled: [],
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

			const segmentBlockings =
				this.playService.currentSnapshot.data.segment_blocking ?? []
			segmentBlockings.forEach((sb) => {
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

	private applyEvents(events: TimelineEvent[]) {
		this.setToCurrentSnapshot()
		setTimeout(() => this.consumeEvents(events), 2)
	}

	private consumeEvents(events: TimelineEvent[]) {
		const vehicleReduceMap = new Map<
			TimelineEvent['historySourceId'],
			VehicleHistoryEvent
		>()
		events
			.filter((e) => e.tableName === 'vehicle_history')
			.forEach((event) => {
				const id = event.historySourceId
				const eventInMap = vehicleReduceMap.get(id)
				// @ts-ignore
				vehicleReduceMap.set(id, { ...eventInMap, ...event })
			})
		const segmentBlockingEvents = events.filter(
			(e) => e.tableName === 'segment_blocking_history',
		) as SegmentBlockingHistoryEvent[]
		vehicleReduceMap.forEach((event) => this.applyVehicleHistoryEvent(event))
		segmentBlockingEvents.forEach((event) =>
			this.applySegmentBlockingHistoryEvent(event),
		)
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
			console.log('clockchanged', event)
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

	changeFocus(event: any) {
		this.selectedObject = event
		// @ts-ignore
		this.focusOnTM({ type: event.objectType, id: event.id })
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
	public onContectMenuOn(event: CustomEvent) {}
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
