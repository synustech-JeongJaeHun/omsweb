import {
	Component,
	EventEmitter,
	OnDestroy,
	OnInit,
	Output,
} from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { AuthService } from '../../../services/auth.service'
import { DialogService } from '../../../services/dialog.service'
import { MessagesService } from '../../../services/messages.service'
import { SettingsService } from '../../../services/settings.service'
import { MapStatesService } from '../../track-map/map-states.service'
import { PermissionEnums } from '../../../models/enums'
import { ClientPreferences } from '../../../models/settings.model'
import { MatDialog } from '@angular/material/dialog'
import { UnusedListDialogComponent } from '../../shared/dialogs/unused-list-dialog.component'

@Component({
	selector: 'oms-status-control',
	templateUrl: './status-control.component.html',
	styleUrls: ['./status-control.component.scss'],
})
export class StatusControlComponent implements OnInit, OnDestroy {
	@Output() findAndFocus = new EventEmitter<{ type: string; id: number }>()

	resizeHandler: any
	tableHeightNum = 300

	readonly permissionEnums: typeof PermissionEnums = PermissionEnums
	bufferEnabled: boolean = true

	preference: ClientPreferences

	get tableHeight(): string {
		return this.tableHeightNum.toString()
	}
	get canControl(): boolean {
		return this.auth.isAuthenticated
	}

	tabNames = [
		{ id: 1, title: 'Orders' },
		{ id: 2, title: 'Vehicles' },
		{ id: 3, title: 'Stations' },
		{ id: 4, title: 'Buffers' },
		{ id: 5, title: 'Zcus' },
		{ id: 6, title: 'Cps' },
	]
	currentTab: number = 0

	constructor(
		private auth: AuthService,
		private mapStateSvc: MapStatesService,
		private messageSvc: MessagesService,
		private settingSvc: SettingsService,
		private dialogSvc: DialogService,
		private $t: TranslateService,
		private dialog: MatDialog,
	) {
		this.preference = this.settingSvc.globalPreferences
		settingSvc.serviceConfig.subscribe(
			(config) => (this.bufferEnabled = config.bufferEnabled),
		)
	}

	ngOnInit(): void {
		this.resizeHandler = this.onMouseMove.bind(this)
		this.currentTab = this.settingSvc.globalPreferences.uiStates.controlTab

		this.resizeTableHeight(this.tableHeightNum)
	}

	ngOnDestroy(): void {
		this.resizeTableHeight(0)
	}

	resizeTableHeight(height: number) {
		this.tableHeightNum = height
		setTimeout(() => {
			this.mapStateSvc.statusTableHeight = this.tableHeightNum
			this.mapStateSvc.statusTableResizeEvent$.next(this.tableHeightNum)
		}, 0)
	}

	hasPermissions(permissions: number[]): boolean {
		return this.auth && this.auth.hasPermissions(permissions)
	}

	canDisplayTable(type: string): boolean {
		return this.preference.controlTables[type]
	}

	onViewUnusedList() {
		const dialog = this.dialog.open(UnusedListDialogComponent, {
			minWidth: '600px',
			maxWidth: '1000px',
			hasBackdrop: false,
		})

		const eventEmitter = new EventEmitter<{ type: string; id: number }>()
		eventEmitter.subscribe((event) => this.findAndFocus.emit(event))

		dialog.componentInstance.findAndFocus = eventEmitter
	}

	onVehicleReset() {
		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmResetAllVehicles') })
			.subscribe((confirm) => {
				if (confirm) {
					this.messageSvc
						.sendVehicleAllCommand({ action: 'reset', vehicleId: '*' })
						.subscribe()
				}
			})
	}
	onSetAuto() {
		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmSetAutoAll') })
			.subscribe((confirm) => {
				if (confirm) {
					this.messageSvc
						.sendVehicleAllCommand({ action: 'initialize', vehicleId: '*' })
						.subscribe()
				}
			})
	}
	onEStop() {
		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmEstopAll') })
			.subscribe((confirm) => {
				if (confirm) {
					this.messageSvc
						.sendVehicleAllCommand({ action: 'stop', vehicleId: '*' })
						.subscribe()
				}
			})
	}

	onMouseMove(event) {
		let resizedH = window.innerHeight - event.clientY
		if (resizedH < 40) {
			resizedH = 40
			this.resizeViewerStop(event)
		} else if (resizedH > window.innerHeight) {
			resizedH = window.innerHeight
			window.removeEventListener('mousemove', this.resizeHandler)
		}
		document.getElementById('status-control-container').style.height =
			resizedH + 'px'

		this.resizeTableHeight(resizedH - 37)
	}
	onChangeTab(selectedIndex: number) {
		const pref = this.settingSvc.globalPreferences
		pref.uiStates.controlTab = selectedIndex
		this.settingSvc.globalPreferences.save()
	}

	resizeViewerStart() {
		window.addEventListener('mousemove', this.resizeHandler)
	}

	resizeViewerStop(event) {
		if (event.type === 'mouseleave') {
			if (window.innerHeight - event.clientY < 0) {
				window.removeEventListener('mousemove', this.resizeHandler)
			}
		}
		if (event.type === 'mouseup') {
			window.removeEventListener('mousemove', this.resizeHandler)
		}

		// this.mapStateSvc.statusTableResizeEvent$.next();
	}

	viewerHide() {
		this.mapStateSvc.changeToolbarState('controlTable', false)
		this.resizeTableHeight(0)
	}
	shrinkViewer() {
		const height = document.getElementById('status-control-container').style
			.height
		if (height === '40px') {
			document.getElementById('status-control-container').style.height = '365px'
			this.resizeTableHeight(300)
		} else {
			document.getElementById('status-control-container').style.height = '40px'
			this.resizeTableHeight(0)
		}
	}
}
