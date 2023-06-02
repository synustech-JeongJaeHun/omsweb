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
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { UnusedListDialogComponent } from '../../shared/dialogs/unused-list-dialog.component'
import {Subject} from "rxjs";
import {auditTime, takeUntil} from "rxjs/operators";
import {AuditTimeDuration} from "@oms/root/modules/monitor/tables/constants";

@Component({
	selector: 'oms-status-control',
	templateUrl: './status-control.component.html',
	styleUrls: ['./status-control.component.scss'],
})
export class StatusControlComponent implements OnInit, OnDestroy {
	@Output() findAndFocus = new EventEmitter<{ type: string; id: number }>()
	@Output() focus = new EventEmitter<{
		type: string
		id: number
		focusType?: string
	}>()
	@Output() dropFocus = new EventEmitter<{ focusType?: string }>()

	resizeHandler: any
	tableHeightNum = 300

	readonly permissionEnums: typeof PermissionEnums = PermissionEnums
	bufferEnabled: boolean = true

	preference: ClientPreferences

  private destroy$: Subject<void> = new Subject<void>()

	get tableHeight(): number {
		return this.tableHeightNum
	}
	get canControl(): boolean {
		return this.auth.isAuthenticated
	}

	currentTab: number = 0
  currentTabName: string = 'orders'

	_unusedListDialog: MatDialogRef<UnusedListDialogComponent, any> = null

  tableKeys:string[] = []

	constructor(
		private auth: AuthService,
		private mapStateSvc: MapStatesService,
		private messageSvc: MessagesService,
		private settingSvc: SettingsService,
		private dialogSvc: DialogService,
		private $t: TranslateService,
		private dialog: MatDialog,
	) {
    this.currentTab = this.settingSvc.globalPreferences.uiStates.controlTab
    this.initLoad()
    settingSvc.tableChanged$
      .pipe(auditTime(AuditTimeDuration), takeUntil(this.destroy$))
      .subscribe(()=>{
        this.initLoad()
    })
	}

  initLoad(){
    this.preference = this.settingSvc.globalPreferences
    this.settingSvc.serviceConfig.subscribe(
      (config) => {
        this.bufferEnabled = config.bufferEnabled
        if(!this.bufferEnabled){
          this.settingSvc.globalPreferences.controlTables.buffers =false
        }
      },
    )
    const keys = Object
      .keys(this.settingSvc.globalPreferences.controlTables)
      .filter(key=> {
        if(this.canControl){
          if(!key.includes('_')) return key
        }
        else{
          if(key.endsWith('orders') || key.endsWith('vehicles')) return key
        }
      })
    this.tableKeys = keys.filter(k=>{
      if(this.settingSvc.globalPreferences.controlTables[k]) return k
    })

    this.resizeHandler = this.onMouseMove.bind(this)
    this.resizeTableHeight(this.tableHeightNum)


    this.currentTab = this.tableKeys.findIndex(t=>t===this.currentTabName)
  }

	ngOnInit(): void {

	}

	ngOnDestroy(): void {
		this.resizeTableHeight(0)
    this.destroy$.next()
    this.destroy$.complete()
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
		if (this._unusedListDialog) {
			this._unusedListDialog.close()
			return
		}

		this._unusedListDialog = this.dialog.open(UnusedListDialogComponent, {
			width: '590px',
			hasBackdrop: false,
		})

		const eventEmitter = new EventEmitter<{ type: string; id: number }>()
		eventEmitter.subscribe((event) => this.findAndFocus.emit(event))

		this._unusedListDialog.componentInstance.findAndFocus = eventEmitter
		this._unusedListDialog
			.afterClosed()
			.subscribe(() => (this._unusedListDialog = null))
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
    this.currentTabName=this.tableKeys[selectedIndex]
	}

  onTabIndex(type: string):boolean{
    const index = this.tableKeys.findIndex(key=>key.toLowerCase()===type);
    return this.currentTab===index;
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
