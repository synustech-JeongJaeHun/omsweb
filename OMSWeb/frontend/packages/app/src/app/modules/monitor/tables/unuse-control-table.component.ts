import {
	Component,
	EventEmitter,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	Output,
	ViewChild,
} from '@angular/core'
import DataSource from 'devextreme/data/data_source'

import { IClusterStatusRow } from '../../../models/cluster-status.model'
import { StatusService } from '../../../services/status.service'
import { SettingsService } from '../../../services/settings.service'
import { merge, Subject } from 'rxjs'
import { HubService } from '../../../services/hub.service'
import { IDataChangeEvent } from '../../../models/notification.model'
import { AuthService } from '../../../services/auth.service'
import { auditTime, takeUntil } from 'rxjs/operators'
import { DxDataGridComponent } from 'devextreme-angular'
import { ClientPreferences } from '../../../models/settings.model'
import { AuditTimeDuration } from './constants'

@Component({
	selector: 'oms-unuse-control-table',
	templateUrl: './unuse-control-table.component.html',
	styleUrls: ['./unuse-control-table.component.scss'],
})
export class UnuseControlTableComponent implements OnInit, OnDestroy {
	@Input() tableHeight: number
	@Output() findAndFocus = new EventEmitter<{ type: string; id: number }>()

	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent
	dataSource: DataSource

	preference: ClientPreferences

	//#region Subscriptions
	private destroy$: Subject<void> = new Subject<void>()
	//#endregion

	get hasControlAccess(): boolean {
		return this.auth.isAuthenticated
	}

	constructor(
		private auth: AuthService,
		private statusSvc: StatusService,
		private settingSvc: SettingsService,
		private hubSvc: HubService,
	) {
        this.dataSource = this.statusSvc.unuseStatusDataSource()
		this.preference = this.settingSvc.globalPreferences
	}

	canDisplayTable(type: string): boolean {
		return this.preference.controlTables[type]
	}
	getDisplayTableColumnIndex(type: string): number {
		return this.preference.controlTables.unuse_order.findIndex(
			(column) => column.name === type,
		)
	}

	getDisplayTableColumnWidth(type: string) {
		return this.preference.controlTables.unuse_order.find(
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
				const column = this.preference.controlTables.unuse_order[c.visibleIndex]
				if (column) column.width = c.width
			})

			this.preference.save()
		},
	}

	ngOnInit() {
		merge(
			this.hubSvc.vehicleTableChanged$,
			this.hubSvc.segmentDisabledChanged$,
			this.hubSvc.stationChanged$,
			this.hubSvc.bufferChanged$,
		)
			.pipe(takeUntil(this.destroy$), auditTime(AuditTimeDuration))
			.subscribe((e: IDataChangeEvent) => {
				e && this.onTableChanged(e)
			})
	}

	ngOnDestroy() {
		this.destroy$.next()
		this.destroy$.complete()
	}

	handleClickView = (event: { row: { data: any } }) => {
		this.findAndFocus.emit({ type: 'station', id: 1 })
	}

	private onTableChanged(payload: IDataChangeEvent) {
		this.dataSource.reload()
	}

	@HostListener('document:visibilitychange', ['$event'])
	private visibilitychange() {
		if (!document.hidden) this.dataSource.reload()
	}
}
