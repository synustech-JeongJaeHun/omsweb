import {
  Component, EventEmitter,
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
import { auditTime, takeUntil } from 'rxjs/operators'
import { DialogService } from '../../../services/dialog.service'
import { TranslateService } from '@ngx-translate/core'
import { MessagesService } from '../../../services/messages.service'
import { DxDataGridComponent } from 'devextreme-angular'
import { ClientPreferences } from '../../../models/settings.model'
import { AuditTimeDuration } from './constants'
import {UnusedListDialogComponent} from "@oms/shared/dialogs/unused-list-dialog.component";

@Component({
	selector: 'oms-station-control-table',
	templateUrl: './station-control-table.component.html',
	styleUrls: ['./station-control-table.component.scss'],
})
export class StationControlTableComponent implements OnInit, OnDestroy {
	@Input() tableHeight: number
	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent

	dataSource: DataSource
	selectedRows: number[] = []
	preference: ClientPreferences
  firePrefix: string = null

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
		this.preference = this.settingSvc.globalPreferences
    settingSvc.serviceConfig.subscribe(
      (config) => {
        this.firePrefix = config.fireStationPrefix
        this.dataSource = this.statusSvc.stationStatusDataSource(this.firePrefix)
      },
    )
	}

	canDisplayTable(type: string): boolean {
		return this.preference.controlTables[type]
	}
	getDisplayTableColumnIndex(type: string): number {
		return this.preference.controlTables.stations_order.findIndex(
			(column) => column.name === type,
		)
	}

	getDisplayTableColumnWidth(type: string) {
		return this.preference.controlTables.stations_order.find(
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
					this.preference.controlTables.stations_order[c.visibleIndex]
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
		this.hubSvc.stationChanged$
			.pipe(auditTime(AuditTimeDuration), takeUntil(this.destroy$))
			.subscribe((e: IDataChangeEvent) => {
				e && this.onTableChanged(e)
			})
	}

	onUnuse() {
		if (!this.canControl) return

		let stationIds: number[] = []
		const items = this.dataGrid.instance.getSelectedRowsData()
		for (let idx = 0; idx < items.length; idx++) {
			stationIds.push(items[idx].id)
		}

		if (stationIds.length > 0) {
			this.dialogSvc
				.verify({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((res) => {
					if (res) {
						const { operator, reason } = res
						this.messageSvc
							.sendStationSettingCommand(
								{
									type: 'UNUSE',
									action: 'station-setting',
									unused: 1,
									user: operator,
									note: reason,
								},
								stationIds,
							)
							.subscribe()
					}
				})
		}
	}

	onUse() {
		if (!this.canControl) return

		let stationIds: number[] = []
		const items = this.dataGrid.instance.getSelectedRowsData()
		for (let idx = 0; idx < items.length; idx++) {
			stationIds.push(items[idx].id)
		}

		if (stationIds.length > 0) {
			this.dialogSvc
				.confirm({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((ok) => {
					ok &&
						this.messageSvc
							.sendStationSettingCommand(
								{ type: 'USE', action: 'station-setting', unused: 0 },
								stationIds,
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

  /*onViewUnusedList() {
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
  }*/
}
