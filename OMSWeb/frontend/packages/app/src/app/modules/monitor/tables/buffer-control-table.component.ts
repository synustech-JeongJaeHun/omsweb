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
  @Input() isOpen: boolean
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

  //여기서 BufferAlert 잡는거 확인


  rowPrepared(e) {
    //datasoruce reload 돌면 여기도 적용 됨.
    if (e.rowType === "data") {
      if (e.data.alertPassedTime === true) { 
        e.rowElement.style.backgroundColor = "#FF4848";//"#ffcdcd";// "#ff0000"; // 배경색 변경
       /* e.rowElement.classList.add('install_carrier') //styles.scss 전역스타일로 적용*/
      }
    }
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
		)?.width
	}

  getDisplayTableLabel(type: string): string {
    return this.preference.controlTables.buffers_order.find(
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
			.pipe(auditTime(AuditTimeDuration), takeUntil(this.destroy$))
			.subscribe((e: IDataChangeEvent) => {
        this.isOpen &&e && this.onTableChanged(e)
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
				.verify({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((res) => {
					if (res) {
						const { operator, reason } = res
						this.messageSvc
							.sendBufferSettingCommand(
								{
									type: 'UNUSE',
									action: 'buffer-setting',
									unused: 1,
									user: operator,
									note: reason,
								},
								bufferIds,
							)
							.subscribe()
					}
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
