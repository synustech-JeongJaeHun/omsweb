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

@Component({
	selector: 'oms-cps-control-table',
	templateUrl: './cps-control-table.component.html',
	styleUrls: ['./cps-control-table.component.scss'],
})
export class CpsControlTableComponent implements OnInit, OnDestroy {
	@Input() tableHeight: number
	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent

	dataSource: DataSource
	selectedRows: number[] = []

	preference: ClientPreferences

	//#region Subscriptions
	private destroy$: Subject<void> = new Subject<void>()
	//#endregion

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
	) {
		this.dataSource = this.statusSvc.clusterStatusDataSource()
		this.preference = this.settingSvc.globalPreferences
	}

	canDisplayTable(type: string): boolean {
		return this.preference.controlTables[type]
	}

	ngOnDestroy(): void {
		this.destroy$.next()
		this.destroy$.complete()
	}

	ngOnInit(): void {
		this.hubSvc.clusterStatusTableChanged$
			.pipe(takeUntil(this.destroy$), auditTime(AuditTimeDuration))
			.subscribe((e: IDataChangeEvent) => {
				e && this.onTableChanged(e)
			})
	}

	private onTableChanged(payload: IDataChangeEvent) {
		this.dataSource.reload()
	}

	@HostListener('document:visibilitychange', ['$event'])
	private visibilitychange() {
		if (!document.hidden) this.dataSource.reload()
	}
}
