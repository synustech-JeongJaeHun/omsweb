import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core'
import {
	defaultToggleOptions,
	ToggleOptionsType,
} from '@oms/models/settings.model'
import { ToggleOptionKeyType } from '../../../models/enums'

import { MapStatesService } from '../map-states.service'
import { SearchDialogComponent } from '../dialogs/search-dialog.component'
import {
	MatDialog,
	MatDialogRef,
	MatDialogState,
} from '@angular/material/dialog'
import { CommandDialogComponent } from '../dialogs/command-dialog.component'
import { ShowObjectDialogComponent } from '../dialogs/show-object-dialog.component'
import { AuthService } from '../../../services/auth.service'
import { PlaybackPlayService } from '@oms/root/services/playback-play.service'
import { AccountUtil } from '../../shared/utils/account.util'
import { SettingsService } from '../../../services/settings.service'
import { PermissionEnums } from '../../../models/enums'
import { TrackMonitorSettingService } from '@oms/root/services/track-monitor-setting.service'
import { PlaybackVehicleStatusDialogComponent } from '../dialogs/playback-vehicle-status-dialog.component'
import { PlaybackControlDialogComponent } from '../../playback/dialogs/playback-control-dialog.component'
import { PlaybackTrackVehicleDialogComponent } from '../dialogs/playback-track-vehicle-dialog.component'
import { PlaybackAlertDialogComponent } from '../../playback/dialogs/playback-alert-dialog.component'
import { ClockChangedEvent } from '@oms/root/models/playback.model'
import { Subscription } from 'rxjs'

@Component({
	selector: 'oms-playback-map-toolbar',
	templateUrl: './playback-map-toolbar.component.html',
	styleUrls: ['playback-map-toolbar.component.scss'],
})
export class PlaybackMapToolbarComponent implements OnInit, OnDestroy {
	@Input()
	buttonState: ToggleOptionsType = defaultToggleOptions
	readonly permissionEnums: typeof PermissionEnums = PermissionEnums
	bufferEnabled: boolean

	@Output() centerZoom = new EventEmitter<void>()
	@Output() find = new EventEmitter<{ type: string; id: any }>()
	@Output() focus = new EventEmitter<{ type: string; id: any }>()
	@Output() track = new EventEmitter<{ type: string; id: any }>()
	@Output() state = new EventEmitter<boolean>()

	@ViewChild('btnSearch', { read: ElementRef }) btnSearch: ElementRef
	@ViewChild('btnTrack', { read: ElementRef }) btnTrack: ElementRef
	@ViewChild('btnCommand', { read: ElementRef }) btnCommand: ElementRef
	@ViewChild('btnShowObj', { read: ElementRef }) btnShowObj: ElementRef

	visibilityOpen = false

	get canControl(): boolean {
		return this.auth.isAuthenticated
	}
	get isTracking(): boolean {
		return this.stateSvc.vehicleTrackingState.status
	}
	get showToolName(): boolean {
		return this.settingSvc.globalPreferences.toggles.showToolName
	}
	get tooltipOffset(): string {
		return this.showToolName ? '164px' : '36px'
	}

	getAlarmStatus(): any {
		return this.playbackSvc.currentAlarms.length > 0 ? '-active' : '-inactive'
	}

	private _searchDlg: MatDialogRef<SearchDialogComponent, any>
	private _trackDlg: MatDialogRef<PlaybackTrackVehicleDialogComponent, any>
	private _cmdDlg: MatDialogRef<CommandDialogComponent, any>
	private _showObjDlg: MatDialogRef<ShowObjectDialogComponent, any>
	private _vhStatusDlg: MatDialogRef<PlaybackVehicleStatusDialogComponent, any>
	private _controlDlg: MatDialogRef<PlaybackControlDialogComponent, any>
	private _alertDlg: MatDialogRef<PlaybackAlertDialogComponent, any>
	private _serviceSubscription: Subscription

	constructor(
		private auth: AuthService,
		private stateSvc: MapStatesService,
		private settingSvc: SettingsService,
		private dialog: MatDialog,
		private playbackSvc: PlaybackPlayService,
		public trackMonitorSettingService: TrackMonitorSettingService,
	) {
		this.onPlaybackDialog()
		// 🎉 subscribe every emited Event from playbackSvc
		this._serviceSubscription = playbackSvc.clockChanged.subscribe(
			(e: ClockChangedEvent) => {
				if (
					this._alertDlg &&
					this._alertDlg.getState() === MatDialogState.OPEN &&
					e.type === 'NextFrameEvent' &&
					e.alarms.length > 0 &&
					playbackSvc.currentAlarms.length === 0
				) {
					this._alertDlg.close()
				}

				if (
					e.type === 'NextFrameEvent' &&
					e.alarms.some((a) => a.historyChangeType === 'INSERT')
				) {
					this.onAlertDialog(false)
				}
			},
		)
	}

	onPlaybackDialog() {
		if (
			this._controlDlg &&
			this._controlDlg.getState() === MatDialogState.OPEN
		) {
			this._controlDlg.close()
			return
		}

		this._controlDlg = this.dialog.open(PlaybackControlDialogComponent, {
			maxWidth: '600px',
			maxHeight: '50vh',
			hasBackdrop: false,
			disableClose: true,
			closeOnNavigation: true,
		})
	}

	/**
	 * @summary alertDlg를 open 하게 해주는 메서드
	 * @param closable - default: true, false일 경우 이미 창이 켜져 있으면 close 하지 않고 open 상태 유지
	 * @returns void
	 */
	onAlertDialog(closable = true): void {
		if (this._alertDlg && this._alertDlg.getState() === MatDialogState.OPEN) {
			if (closable) this._alertDlg.close()
			return
		}

		this._alertDlg = this.dialog.open(PlaybackAlertDialogComponent, {
			maxWidth: '800px',
			maxHeight: '50vh',
			hasBackdrop: false,
			disableClose: true,
			closeOnNavigation: true,
			panelClass: 'playback-alarms-dialog',
		})
	}

	ngOnInit(): void {}

	ngOnDestroy(): void {
		this._searchDlg &&
			this._searchDlg.getState() === MatDialogState.OPEN &&
			this._searchDlg.close()

		this._trackDlg &&
			this._trackDlg.getState() === MatDialogState.OPEN &&
			this._trackDlg.close()

		this._cmdDlg &&
			this._cmdDlg.getState() === MatDialogState.OPEN &&
			this._cmdDlg.close()

		this._showObjDlg &&
			this._showObjDlg.getState() === MatDialogState.OPEN &&
			this._showObjDlg.close()

		this._vhStatusDlg &&
			this._vhStatusDlg.getState() === MatDialogState.OPEN &&
			this._vhStatusDlg.close()

		this._controlDlg &&
			this._controlDlg.getState() === MatDialogState.OPEN &&
			this._controlDlg.close()

		// this._bfStatusDlg &&
		//   this._bfStatusDlg.getState() === MatDialogState.OPEN &&
		//   this._bfStatusDlg.close();
		this._alertDlg &&
			this._alertDlg.getState() === MatDialogState.OPEN &&
			this._alertDlg.close()

		this._serviceSubscription.unsubscribe()
	}

	hasPermission(permission: number): boolean {
		return AccountUtil.hasPermission(permission, this.auth.currentUser)
	}

	onSearch() {
		if (this._searchDlg && this._searchDlg.getState() === MatDialogState.OPEN) {
			this._searchDlg.close()
			return
		}
		const rect: DOMRect = this.btnSearch.nativeElement.getBoundingClientRect()
		this._searchDlg = this.dialog.open(SearchDialogComponent, {
			width: '350px',
			hasBackdrop: false,
			disableClose: true,
			closeOnNavigation: true,
			position: { left: this.tooltipOffset, top: `${rect.top}px` },
		})

		this._searchDlg
			.afterClosed()
			.subscribe((payload: { type: string; id: any }) => {
				if (!payload || !payload.type || !payload.id) return
				this.find.emit({ type: payload.type, id: payload.id })
				this.focus.emit({ type: payload.type, id: payload.id })
			})
	}

	onTrackVehicle() {
		if (this._trackDlg && this._trackDlg.getState() === MatDialogState.OPEN) {
			this._trackDlg.close()
			return
		}

		const rect: DOMRect = this.btnTrack.nativeElement.getBoundingClientRect()
		this._trackDlg = this.dialog.open(PlaybackTrackVehicleDialogComponent, {
			width: '350px',
			autoFocus: false,
			hasBackdrop: false,
			disableClose: true,
			closeOnNavigation: true,
			position: { left: this.tooltipOffset, top: `${rect.top}px` },
		})

		this._trackDlg.afterClosed().subscribe((payload?: number) => {
			if (!payload) return
			this.find.emit({ type: 'vehicle', id: payload })
			this.focus.emit({ type: 'vehicle', id: payload })
			this.track.emit({ type: 'vehicle', id: payload })
		})
	}

	onTuneVisibility() {
		if (
			this._showObjDlg &&
			this._showObjDlg.getState() === MatDialogState.OPEN
		) {
			this._showObjDlg.close()
			return
		}

		const rect = this.btnShowObj.nativeElement.getBoundingClientRect()
		this._showObjDlg = this.dialog.open(ShowObjectDialogComponent, {
			width: '420px',
			autoFocus: false,
			hasBackdrop: false,
			disableClose: false,
			closeOnNavigation: true,
			position: { left: this.tooltipOffset, top: `${rect.top}px` },
      data: {isMonitor: false},
		})
	}

	onToggleTool(action: ToggleOptionKeyType) {
		const value = !this.buttonState[action]
		this.buttonState[action] = value
		this.stateSvc.changeToolbarState(action, value)
	}

	onOpenVehicleStatus() {
		if (
			this._vhStatusDlg &&
			this._vhStatusDlg.getState() === MatDialogState.OPEN
		) {
			this._vhStatusDlg.close()
			return
		}

		this._vhStatusDlg = this.dialog.open(PlaybackVehicleStatusDialogComponent, {
			width: '750px',
			minWidth: '750px',
			maxWidth: '750px',
			height: '620px',
			minHeight: '620px',
			maxHeight: '620px',
			autoFocus: false,
			hasBackdrop: false,
			disableClose: false,
			closeOnNavigation: true,
		})
	}

	// onOpenBufferStatus() {
	//   if (
	//     this._bfStatusDlg &&
	//     this._bfStatusDlg.getState() === MatDialogState.OPEN
	//   ) {
	//     this._bfStatusDlg.close();
	//     return;
	//   }

	//   this._bfStatusDlg = this.dialog.open(BufferStatusDialogComponent, {
	//     width: '450px',
	//     autoFocus: false,
	//     hasBackdrop: false,
	//     disableClose: false,
	//     closeOnNavigation: true,
	//   });
	// }
}
