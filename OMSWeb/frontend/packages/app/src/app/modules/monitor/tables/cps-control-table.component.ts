import {
	Component,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core'
import DataSource from 'devextreme/data/data_source'

import { IClusterStatusRow } from '../../../models/cluster-status.model'
import { StatusService } from '../../../services/status.service'
import { SettingsService } from '../../../services/settings.service'
import { Subject } from 'rxjs'
import { HubService } from '../../../services/hub.service'
import { IDataChangeEvent } from '../../../models/notification.model'
import { AuthService } from '../../../services/auth.service'
import { auditTime, takeUntil } from 'rxjs/operators'
import { DxDataGridComponent } from 'devextreme-angular'
import { ClientPreferences } from '../../../models/settings.model'
import { AuditTimeDuration } from './constants'
import { CpsReferenceDialogComponent } from '../../shared/dialogs/cps-reference-dialog.component'
import {
	MatDialog,
	MatDialogRef,
	MatDialogState,
} from '@angular/material/dialog'
import {SystemsService} from "../../..//services/systems.service";
import {PeriodicElement, rangeCheck} from "../../../models/cps-status.model";

@Component({
	selector: 'oms-cps-control-table',
	templateUrl: './cps-control-table.component.html',
	styleUrls: ['./cps-control-table.component.scss'],
})
export class CpsControlTableComponent implements OnInit, OnDestroy {
	@Input() tableHeight: number
  @Input() isOpen: boolean
	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent

	dataSource: DataSource
	selectedRows: number[] = []

	preference: ClientPreferences

  cpsDataSource:PeriodicElement[]

	//#region Subscriptions
	private destroy$: Subject<void> = new Subject<void>()
	//#endregion

	private color_normal: string = 'rgba(240, 255, 255, 1.0)'
	private color_warning: string = 'rgba(255, 210, 0, 0.5)'
	private color_fault: string = 'rgba(255, 0, 0, 0.5)'
	private color_failover: string = 'rgba(140, 140, 140, 0.5'

	private _cpsRefDlg: MatDialogRef<CpsReferenceDialogComponent, any>

	get hasControlAccess(): boolean {
		return this.auth.isAuthenticated
	}

	get canReset(): boolean {
		return this.selectedRows.length > 0
	}

	get selectedItems(): IClusterStatusRow[] {
		return this.dataGrid.instance.getSelectedRowsData()
	}

	constructor(
		private auth: AuthService,
		private statusSvc: StatusService,
		private settingSvc: SettingsService,
		private hubSvc: HubService,
		private dialog: MatDialog,

    private systemSvc: SystemsService
	) {
		this.dataSource = this.statusSvc.clusterStatusDataSource()
		this.preference = this.settingSvc.globalPreferences
	}

	canDisplayTable(type: string): boolean {
		return this.preference.controlTables[type]
	}
	getDisplayTableColumnIndex(type: string): number {
		return this.preference.controlTables.cps_order.findIndex(
			(column) => column.name === type,
		)
	}

	getDisplayTableColumnWidth(type: string) {
		return this.preference.controlTables.cps_order.find(
			(column) => column.name === type,
		)?.width
	}

  getDisplayTableLabel(type: string): string {
    return this.preference.controlTables.cps_order.find(
      (column) => column.name === type,
    )?.i18nLabel
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
				const column = this.preference.controlTables.cps_order[c.visibleIndex]
				if (column) column.width = c.width
			})

			this.preference.save()
		},
	}

	getBgColor(type: number, value: string): string {
    if(!this.cpsDataSource) {
      this.systemSvc.reference.subscribe(res=>{
        this.cpsDataSource = res
      })
      return this.color_normal;
    }

		if (type == 0) return this.getColor_Status(value) // Status
		else if (type == 1) return this.getColor_Voltage(value) // Voltage
		else if (type == 2) return this.getColor_CurrentIgbt(value) // current igbt
		else if (type == 3)
			return this.getColor_CurrentTrack(value) // current track
		else if (type == 4)
			return this.getColor_TempRadiator(value) // temp radiator
		else if (type == 5) return this.getColor_TempInternal(value) // temp internal
	}

	private getColor_Status(value: string): string {
		if (value === 'RUN') return this.color_normal
		else if (value === 'STOP') return this.color_normal
		else if (value === 'Warning') return this.color_warning
		else if (value === 'Fault') return this.color_fault
		else if (value === 'Fail-Over') return this.color_failover
		else if (value === 'Comm-Fail') return this.color_normal
		return this.color_normal
	}
	private getColor_Voltage(value: string): string {
		let volt = parseInt(value)
		/*if (volt<=0) return this.color_normal
    else if (510 < volt && volt < 650) return this.color_normal
		else if (430 < volt && volt <= 510) return this.color_warning
    else if (650 <= volt && volt < 675) return this.color_warning
		else if (430 >= volt) return this.color_fault
    else if (675 <= volt) return this.color_fault
		return this.color_normal*/
    if(volt<=0) return this.color_normal
    if(this.cpsDataSource[0]?.normal.some(c=>rangeCheck(c, volt))) return this.color_normal
    if(this.cpsDataSource[0]?.warning.some(c=>rangeCheck(c, volt))) return this.color_warning
    if(this.cpsDataSource[0]?.fault.some(c=>rangeCheck(c, volt))) return this.color_fault
    return this.color_normal
	}
	private getColor_CurrentIgbt(value: string): string {
		let curr = parseInt(value)
		/*if (0 <= curr && curr < 130) return this.color_normal
		else if (130 <= curr && curr < 145) return this.color_warning
		else if (145 <= curr) return this.color_fault
		return this.color_normal*/

    if(curr<=0) return this.color_normal
    if(this.cpsDataSource[1]?.normal.some(c=>rangeCheck(c, curr))) return this.color_normal
    if(this.cpsDataSource[1]?.warning.some(c=>rangeCheck(c, curr))) return this.color_warning
    if(this.cpsDataSource[1]?.fault.some(c=>rangeCheck(c, curr))) return this.color_fault
    return this.color_normal
	}
	private getColor_CurrentTrack(value: string): string {
		let curr = parseInt(value)
    /*if (curr <= 0) return this.color_normal
		else if (0 < curr &&curr <= 70) return this.color_warning
		else if (70 < curr && curr < 85) return this.color_normal
		else if (85 <= curr && curr < 90) return this.color_warning
		else if (90 <= curr) return this.color_fault
		return this.color_normal*/

    if(curr<=0) return this.color_normal
    if(this.cpsDataSource[2]?.normal.some(c=>rangeCheck(c, curr))) return this.color_normal
    if(this.cpsDataSource[2]?.warning.some(c=>rangeCheck(c, curr))) return this.color_warning
    if(this.cpsDataSource[2]?.fault.some(c=>rangeCheck(c, curr))) return this.color_fault
    return this.color_normal
	}
	private getColor_TempRadiator(value: string): string {
		let temp = parseInt(value)
		/*if (0 <= temp && temp < 60) return this.color_normal
		else if (60 <= temp && temp < 80) return this.color_warning
		else if (80 <= temp) return this.color_fault
		return this.color_normal*/

    if(temp<=0) return this.color_normal
    if(this.cpsDataSource[3]?.normal.some(c=>rangeCheck(c, temp))) return this.color_normal
    if(this.cpsDataSource[3]?.warning.some(c=>rangeCheck(c, temp))) return this.color_warning
    if(this.cpsDataSource[3]?.fault.some(c=>rangeCheck(c, temp))) return this.color_fault
    return this.color_normal
	}
	private getColor_TempInternal(value: string): string {
		let temp = parseInt(value)
		/*if (0 <= temp && temp < 35) return this.color_normal
		else if (35 <= temp && temp < 40) return this.color_warning
		else if (40 <= temp) return this.color_fault
		return this.color_normal*/

    if(temp<=0) return this.color_normal
    if(this.cpsDataSource[4]?.normal.some(c=>rangeCheck(c, temp))) return this.color_normal
    if(this.cpsDataSource[4]?.warning.some(c=>rangeCheck(c, temp))) return this.color_warning
    if(this.cpsDataSource[4]?.fault.some(c=>rangeCheck(c, temp))) return this.color_fault
    return this.color_normal
	}

	ngOnInit(): void {
		this.hubSvc.clusterStatusTableChanged$
			.pipe(auditTime(AuditTimeDuration), takeUntil(this.destroy$))
			.subscribe((e: IDataChangeEvent) => {
        this.isOpen &&e && this.onTableChanged(e)
			})
	}

	ngOnDestroy(): void {
		if (this.isOpenedCpsRefDlg()) {
			// close before leave tab
			this._cpsRefDlg.close()
		}

		this.destroy$.next()
		this.destroy$.complete()
	}

	onReferenceValue() {
		if (this.isOpenedCpsRefDlg()) {
			// toggle close
			this._cpsRefDlg.close()
			return
		}

		this._cpsRefDlg = this.dialog.open(CpsReferenceDialogComponent, {
			// toggle open
			width: '450px',
			autoFocus: false,
			hasBackdrop: false,
			disableClose: false,
			closeOnNavigation: true,
		})
	}

	private isOpenedCpsRefDlg(): boolean {
		if (this._cpsRefDlg && this._cpsRefDlg.getState() === MatDialogState.OPEN) {
			return true
		}
		return false
	}

	private onTableChanged(payload: IDataChangeEvent) {
		this.dataSource.reload()
	}

	@HostListener('document:visibilitychange', ['$event'])
	private visibilitychange() {
		if (!document.hidden) this.dataSource.reload()
	}
}
