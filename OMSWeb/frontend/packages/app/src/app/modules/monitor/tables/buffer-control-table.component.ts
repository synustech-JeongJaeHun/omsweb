import {
	Component,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core'
import DataSource from 'devextreme/data/data_source'

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
import { DialogService } from '@oms/root/services/dialog.service'
import { TranslateService } from '@ngx-translate/core'
import { AuditTimeDuration } from './constants'

@Component({
	selector: 'oms-buffer-control-table',
	templateUrl: './buffer-control-table.component.html',
	styleUrls: ['./buffer-control-table.component.scss'],
})
export class BufferControlTableComponent implements OnInit, OnDestroy {
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

	get canControl(): boolean {
		return this.selectedRows.length > 0
	}

	constructor(
		private auth: AuthService,
		private statusSvc: StatusService,
		private settingSvc: SettingsService,
		private dialogSvc: DialogService,
		private $t: TranslateService,
		private messageSvc: MessagesService,
		private hubSvc: HubService,
	) {
		this.dataSource = this.statusSvc.bufferStatusDataSource()
		this.preference = this.settingSvc.globalPreferences
	}

	canDisplayTable(type: string): boolean {
		return this.preference.controlTables[type]
	}

	getDisplayTableColumnIndex(type: string): number {
		return this.preference.controlTables.buffers_order.findIndex(
			(column) => column.name === type,
		)
	}

	getDisplayTableColumnWidth(type: string) {
		return this.preference.controlTables.buffers_order.find(
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
				const column =
					this.preference.controlTables.buffers_order[c.visibleIndex]
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
		this.hubSvc.bufferChanged$
			.pipe(takeUntil(this.destroy$), auditTime(AuditTimeDuration))
			.subscribe((e: IDataChangeEvent) => {
				e && this.onTableChanged(e)
			})
	}

	onUnuse() {
		if (!this.canControl) return

		let bufferIds: number[] = []
		const items = this.dataGrid.instance.getSelectedRowsData()
		for (let idx = 0; idx < items.length; idx++) {
			bufferIds.push(items[idx].id)
		}

		if (bufferIds.length > 0) {
			this.dialogSvc
				.confirm({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((ok) => {
					ok &&
						this.messageSvc
							.sendBufferSettingCommand(
								{ type: 'UNUSE', action: 'buffer-setting', unused: 1 },
								bufferIds,
							)
							.subscribe()
				})
		}
	}

	onUse() {
		if (!this.canControl) return

		let bufferIds: number[] = []
		const items = this.dataGrid.instance.getSelectedRowsData()
		for (let idx = 0; idx < items.length; idx++) {
			bufferIds.push(items[idx].id)
		}

		if (bufferIds.length > 0) {
			this.dialogSvc
				.confirm({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((ok) => {
					ok &&
						this.messageSvc
							.sendBufferSettingCommand(
								{ type: 'USE', action: 'buffer-setting', unused: 0 },
								bufferIds,
							)
							.subscribe()
				})
		}
	}

	private onTableChanged(payload: IDataChangeEvent) {
		this.dataSource.reload()
	}

	@HostListener('document:visibilitychange', ['$event'])
	private visibilitychange() {
		if (!document.hidden) this.dataSource.reload()
	}
}
