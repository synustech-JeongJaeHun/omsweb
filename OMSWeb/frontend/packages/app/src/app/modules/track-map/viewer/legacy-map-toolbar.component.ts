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
import {
	CommandKeyType,
	ToggleOptionKeyType,
	UserPermissions,
} from '../../../models/enums'

import { MapStatesService } from '../map-states.service'
import { MessagesService } from '@oms/services/messages.service'
import { DialogService } from '@oms/services/dialog.service'
import { TranslateService } from '@ngx-translate/core'
import { SearchDialogComponent } from '../dialogs/search-dialog.component'
import {
	MatDialog,
	MatDialogRef,
	MatDialogState,
} from '@angular/material/dialog'
import { TrackVehicleDialogComponent } from '../dialogs/track-vehicle-dialog.component'
import { CommandDialogComponent } from '../dialogs/command-dialog.component'
import { ShowObjectDialogComponent } from '../dialogs/show-object-dialog.component'
import { AuthService } from '../../../services/auth.service'
import { AccountUtil } from '../../shared/utils/account.util'
import { SettingsService } from '../../../services/settings.service'
import { PermissionEnums } from '../../../models/enums'
import { TrackMonitorSettingService } from '@oms/root/services/track-monitor-setting.service'
import { PlaybackVehicleStatusDialogComponent } from '../dialogs/playback-vehicle-status-dialog.component'
import { PlaybackControlDialogComponent } from '../../playback/dialogs/playback-control-dialog.component'
import { LegacyTrackVehicleDialogComponent } from '../dialogs/legacy-track-vehicle-dialog.component'

@Component({
	selector: 'oms-legacy-map-toolbar',
	templateUrl: './legacy-map-toolbar.component.html',
	styleUrls: ['legacy-map-toolbar.component.scss'],
})
export class LegacyMapToolbarComponent implements OnInit, OnDestroy {
	@Input()
	buttonState: ToggleOptionsType = defaultToggleOptions
	readonly permissionEnums: typeof PermissionEnums = PermissionEnums
	bufferEnabled: boolean

	@Output() centerZoom = new EventEmitter<void>()
	@Output() find = new EventEmitter<{ type: string; id: any }>()
	@Output() focus = new EventEmitter<{ type: string; id: any }>()
	@Output() track = new EventEmitter<{ type: string; id: any }>()

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

	private _searchDlg: MatDialogRef<SearchDialogComponent, any>
	private _trackDlg: MatDialogRef<LegacyTrackVehicleDialogComponent, any>
	private _cmdDlg: MatDialogRef<CommandDialogComponent, any>
	private _showObjDlg: MatDialogRef<ShowObjectDialogComponent, any>
	private _vhStatusDlg: MatDialogRef<PlaybackVehicleStatusDialogComponent, any>
	private _controlDlg: MatDialogRef<PlaybackControlDialogComponent, any>
	// private _bfStatusDlg: MatDialogRef<BufferStatusDialogComponent, any>;

	constructor(
		private auth: AuthService,
		private stateSvc: MapStatesService,
		private messageSvc: MessagesService,
		private settingSvc: SettingsService,
		private dialogSvc: DialogService,
		private dialog: MatDialog,
		private $t: TranslateService,
		public trackMonitorSettingService: TrackMonitorSettingService,
	) {
		// settingSvc.serviceConfig.subscribe((config) => {
		//   this.bufferEnabled = config.bufferEnabled;
		// });
		this.onPlaybackDialog()
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
			width: '90vw',
			maxWidth: '800px',
			hasBackdrop: false,
			disableClose: true,
			closeOnNavigation: true,
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
		this._trackDlg = this.dialog.open(LegacyTrackVehicleDialogComponent, {
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
			width: '350px',
			autoFocus: false,
			hasBackdrop: false,
			disableClose: false,
			closeOnNavigation: true,
			position: { left: this.tooltipOffset, top: `${rect.top}px` },
			data: this.buttonState,
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
			height: '540px',
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
