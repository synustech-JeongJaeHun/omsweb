import {
	Component,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core'
import DataSource from 'devextreme/data/data_source'

import { IZcuStatusRow } from '../../../models/zcu-status.model'
import { StatusService } from '../../../services/status.service'
import { SettingsService } from '../../../services/settings.service'
import { Subject } from 'rxjs'
import { HubService } from '../../../services/hub.service'
import { IDataChangeEvent } from '../../../models/notification.model'
import { AuthService } from '../../../services/auth.service'
import { takeUntil, auditTime } from 'rxjs/operators'
import { MessagesService } from '../../../services/messages.service'
import { DxDataGridComponent } from 'devextreme-angular'
import { ClientPreferences } from '../../../models/settings.model'
import { DialogService } from '../../../services/dialog.service'
import { TranslateService } from '@ngx-translate/core'
import { AuditTimeDuration } from './constants'

@Component({
	selector: 'oms-zcu-control-table',
	templateUrl: './zcu-control-table.component.html',
	styleUrls: ['./zcu-control-table.component.scss'],
})
export class ZcuControlTableComponent implements OnInit, OnDestroy {
	@Input() tableHeight: number
	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent

	dataSource: DataSource
	selectedRows: number[] = []

	preference: ClientPreferences

  zcuDetail:boolean =false

	private color_normal: string = 'rgba(240, 255, 255, 1.0)'
	private color_error: string = 'rgba(255, 0, 0, 0.5)'

	//#region Subscriptions
	private destroy$: Subject<void> = new Subject<void>()
	//#endregion

	get hasControlAccess(): boolean {
		return this.auth.isAuthenticated
	}

	get canReset(): boolean {
		return this.selectedRows.length > 0
	}

	get selectedItems(): IZcuStatusRow[] {
		return this.dataGrid.instance.getSelectedRowsData()
	}

	constructor(
		private auth: AuthService,
		private statusSvc: StatusService,
		private settingSvc: SettingsService,
		private messageSvc: MessagesService,
		private dialogSvc: DialogService,
		private $t: TranslateService,
		private hubSvc: HubService,
	) {
		this.dataSource = this.statusSvc.zcuStatusDataSource()
		this.preference = this.settingSvc.globalPreferences
    settingSvc.serviceConfig.subscribe(
      (config) => (
          this.zcuDetail = config.zcuDetail
      ))
	}

	canDisplayTable(type: string): boolean {
		return this.preference.controlTables[type]
	}

	getDisplayTableColumnIndex(type: string): number {
		return this.preference.controlTables.zcus_order.findIndex(
			(column) => column.name === type,
		)
	}

	getDisplayTableColumnWidth(type: string) {
		return this.preference.controlTables.zcus_order.find(
			(column) => column.name === type,
		).width
	}

	stateStoring = {
		enabled: true,
		type: 'custom',
		customSave: (configuration: {
			columns: {
				dataField: string
				dataType: string
				name: string
				visible: boolean
				visibleIndex: number
				width: number
			}[]
		}) => {
			configuration.columns.forEach((c) => {
				const column = this.preference.controlTables.zcus_order[c.visibleIndex]
				if (column) column.width = c.width
			})

			this.preference.save()
		},
	}

	ngOnDestroy(): void {
		this.destroy$.next()
		this.destroy$.complete()
	}

	ngOnInit(): void {
		this.hubSvc.zcuStatusTableChanged$
			.pipe(auditTime(AuditTimeDuration), takeUntil(this.destroy$))
			.subscribe((e: IDataChangeEvent) => {
				e && this.onTableChanged(e)
			})
	}

	getBgColor(type: number, value: string): string {
		return this.getColor_Status(value) // Status
	}

	private getColor_Status(value: string): string {
		if (value === 'Normal') return this.color_normal
		else if (value === 'Error') return this.color_error
		return this.color_normal
	}

	onReset(type :'hw'|'sw' = 'hw') {
		if (!this.canReset) return

		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmZcuReset') })
			.subscribe((confirm) => {
				if (confirm) {
					this.messageSvc
						.sendZcuCommand({
              action: 'zcu_reset',
							zcuIds: this.selectedRows,
              zcuUsingType: type
						})
						.subscribe()
				}
			})
	}

	onSetHw() {
		if (!this.canReset) return

		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmZcuChange') })
			.subscribe((confirm) => {
				if (confirm) {
					this.messageSvc
						.sendSettingZcuCommand({
							action: 'zcu-setting',
							zcuIds: this.selectedRows,
							zcuUsingType: 'hw',
						})
						.subscribe()
				}
			})
	}

	onSetSw() {
		if (!this.canReset) return

		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmZcuChange') })
			.subscribe((confirm) => {
				if (confirm) {
					this.messageSvc
						.sendSettingZcuCommand({
							action: 'zcu-setting',
							zcuIds: this.selectedRows,
							zcuUsingType: 'sw',
						})
						.subscribe()
				}
			})
	}

	private onTableChanged(payload: IDataChangeEvent) {
		this.dataSource.reload()
	}

	@HostListener('document:visibilitychange', ['$event'])
	private visibilitychange() {
		if (!document.hidden) this.dataSource.reload()
	}

  private setVHLInfoOnHW(){
    this.dataSource.store().load().done(list=>{
      list.forEach(item=>{
        if(item.usingType==='HW'){
          item.logicalId=''
          item.passVehicle=''
          item.vehicleCount=''
          item.vehicleInfo=''
        }
      })
    })
  }
}
