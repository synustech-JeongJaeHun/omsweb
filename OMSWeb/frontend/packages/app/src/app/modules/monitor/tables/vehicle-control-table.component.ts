import {
	Component,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core'
import DataSource from 'devextreme/data/data_source'

import { IVehicleStatusRow } from '../../../models/vehicle-status.model'
import { StatusService } from '../../../services/status.service'
import { SettingsService } from '../../../services/settings.service'
import { Subject } from 'rxjs'
import { HubService } from '../../../services/hub.service'
import { IDataChangeEvent } from '../../../models/notification.model'
import { AuthService } from '../../../services/auth.service'
import { AccountUtil } from '../../shared/utils/account.util'
import { auditTime, takeUntil } from 'rxjs/operators'
import { DxDataGridComponent } from 'devextreme-angular'
import { DialogService } from '../../../services/dialog.service'
import { TranslateService } from '@ngx-translate/core'
import { MessagesService } from '../../../services/messages.service'
import { PermissionEnums } from '../../../models/enums'
import { ClientPreferences } from '../../../models/settings.model'
import { AuditTimeDuration } from './constants'
import {MobileService} from "@oms/services/mobile.service";

@Component({
	selector: 'oms-vehicle-control-table',
	templateUrl: './vehicle-control-table.component.html',
	styleUrls: ['./vehicle-control-table.component.scss'],
})
export class VehicleControlTableComponent implements OnInit, OnDestroy {
	@Input() tableHeight: number
  @Input() isOpen: boolean
	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent

	dataSource: DataSource
	selectedRows: number[] = []

	enableRows: IVehicleStatusRow[] = []
	disableRows: IVehicleStatusRow[] = []

	preference: ClientPreferences

	//#region Subscriptions
	private destroy$: Subject<void> = new Subject<void>()
	//#endregion

	readonly permissionEnums: typeof PermissionEnums = PermissionEnums

	get hasControlAccess(): boolean {
		return this.auth.isAuthenticated
	}

	get canControl(): boolean {
		return this.selectedRows.length > 0
	}

	get selectedItems(): IVehicleStatusRow[] {
		return this.dataGrid.instance.getSelectedRowsData()
	}

	transform_distance(value: number): string {
		if (value == undefined) {
			return ''
		} else {
			const distance: number = Math.floor(value / 1000000)

			return `${distance}km`
		}
	}

	transform_runtime(value: number): string {
		if (value == undefined) {
			return ''
		} else {
			const day: number = Math.floor(value / 86400) //3600 * 24
			const hour: string = ((value % 86400) / 3600).toFixed(1)

			return `${day}d ` + hour.toString().padStart(2, '0') + 'h'
		}
	}

	constructor(
		private auth: AuthService,
		private statusSvc: StatusService,
		private settingSvc: SettingsService,
		private dialogSvc: DialogService,
		private $t: TranslateService,
		private messageSvc: MessagesService,
		private hubSvc: HubService,

    private mobileSvc: MobileService
	) {
		this.dataSource = this.statusSvc.vehicleStatusDataSource()
		this.preference = this.settingSvc.globalPreferences
	}

	canDisplayTable(type: string): boolean {
		return this.preference.controlTables[type]
	}
	getDisplayTableColumnIndex(type: string): number {
		return this.preference.controlTables.vehicles_order.findIndex(
			(column) => column.name === type,
		)
	}

	getDisplayTableColumnWidth(type: string) {
		return this.preference.controlTables.vehicles_order.find(
			(column) => column.name === type,
		).width
	}

  getDisplayTableLabel(type: string): string {
    return this.preference.controlTables.vehicles_order.find(
      (column) => column.name === type,
    ).i18nLabel
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
					this.preference.controlTables.vehicles_order[c.visibleIndex]
				if (column) column.width = c.width
			})

			this.preference.save()
		},
	}

	ngOnInit(): void {
		this.hubSvc.vehicleTableChanged$
			.pipe(auditTime(AuditTimeDuration), takeUntil(this.destroy$))
			.subscribe((e: IDataChangeEvent) => {
        this.isOpen &&e && this.onTableChanged(e)
			})
	}

	ngOnDestroy(): void {
		this.destroy$.next()
		this.destroy$.complete()
	}

	hasPermission(permission: number): boolean {
		return AccountUtil.hasPermission(permission, this.auth.currentUser)
	}

	onEStop() {
		if (!this.canControl) return
		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmCommand') })
			.subscribe((ok) => {
				ok &&
					this.messageSvc
						.sendVehicleCommand({ action: 'stop' }, this.selectedItems)
						.subscribe()
			})
	}
	onReset() {
		if (!this.canControl) return
		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmCommand') })
			.subscribe((ok) => {
				ok &&
					this.messageSvc
						.sendVehicleCommand({ action: 'reset' }, this.selectedItems)
						.subscribe()
			})
	}
	onSetAuto() {
		if (!this.canControl) return
		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmCommand') })
			.subscribe((ok) => {
				ok &&
					this.messageSvc
						.sendVehicleCommand({ action: 'initialize' }, this.selectedItems)
						.subscribe()
			})
	}

	onSetAutoReverse() {
		if (!this.canControl) return
		this.dialogSvc
			.confirm({ body: this.$t.instant('messages.confirmCommand') })
			.subscribe((ok) => {
				ok &&
					this.messageSvc
						.sendVehicleCommand(
							{ action: 'initialize', direction: 'reverse' },
							this.selectedItems,
						)
						.subscribe()
			})
	}

	onChangeHostOrderActivity() {
		if (!this.canControl) return
		this.enableRows = []
		this.disableRows = []
		for (let index in this.selectedItems) {
			if (this.selectedItems[index].hostOrder)
				this.disableRows.push(this.selectedItems[index])
			else this.enableRows.push(this.selectedItems[index])
		}
		if (this.enableRows.length > 0) {
			this.messageSvc
				.sendVehicleCommand(
					{ action: 'set_behavior', hostOrder: true },
					this.enableRows,
				)
				.subscribe()
		}
		if (this.disableRows.length > 0) {
			this.messageSvc
				.sendVehicleCommand(
					{ action: 'set_behavior', hostOrder: false },
					this.disableRows,
				)
				.subscribe()
		}
	}
	onChangeHostOrderEnable(enable: boolean) {
		if (!this.canControl) return
		if (enable === true) {
			if (this.selectedItems.length > 0) {
				this.messageSvc
					.sendVehicleCommand(
						{ action: 'set_behavior', hostOrder: true },
						this.selectedItems,
					)
					.subscribe()
			}
		} else {
			this.dialogSvc
				.verify({ body: this.$t.instant('messages.confirmCommand') })
				.subscribe((res) => {
					if (res) {
						const { operator, reason } = res
						if (this.selectedItems.length > 0) {
							this.messageSvc
								.sendVehicleCommand(
									{
										action: 'set_behavior',
										hostOrder: false,
										user: operator,
										note: reason,
									},
									this.selectedItems,
								)
								.subscribe()
						}
					}
				})
		}
	}
	onChangePushActivity() {
		if (!this.canControl) return
		this.enableRows = []
		this.disableRows = []
		for (let index in this.selectedItems) {
			if (this.selectedItems[index].canBePushed)
				// now enable --> to disable
				this.disableRows.push(this.selectedItems[index])
			else this.enableRows.push(this.selectedItems[index])
		}
		if (this.enableRows.length > 0) {
			this.messageSvc
				.sendVehicleCommand(
					{ action: 'set_behavior', canBePushed: true },
					this.enableRows,
				)
				.subscribe()
		}

		if (this.disableRows.length > 0) {
			this.messageSvc
				.sendVehicleCommand(
					{ action: 'set_behavior', canBePushed: false },
					this.disableRows,
				)
				.subscribe()
		}
	}
	onChangePushEnable(enable: boolean) {
		if (!this.canControl) return
		if (enable) {
			if (this.selectedItems.length > 0) {
				this.messageSvc
					.sendVehicleCommand(
						{ action: 'set_behavior', canBePushed: true },
						this.selectedItems,
					)
					.subscribe()
			}
		} else {
			if (this.selectedItems.length > 0) {
				this.messageSvc
					.sendVehicleCommand(
						{ action: 'set_behavior', canBePushed: false },
						this.selectedItems,
					)
					.subscribe()
			}
		}
	}
	onRailIn() {
		if (!this.canControl) return
		this.messageSvc
			.sendVehicleCommand({ action: 'rail_in' }, this.selectedItems)
			.subscribe()
	}
	onRailOut() {
		if (!this.canControl) return
		this.messageSvc
			.sendVehicleCommand({ action: 'rail_out' }, this.selectedItems)
			.subscribe()
	}

	private onTableChanged(payload: IDataChangeEvent) {
		this.dataSource.reload().then((data) => {
			this.selectedRows = []
			for (let index in this.selectedItems) {
				this.selectedRows[index] = this.selectedItems[index].id
			}
		})
	}

	@HostListener('document:visibilitychange', ['$event'])
	private visibilitychange() {
		if (!document.hidden) this.dataSource.reload()
	}

  onPmClick() {
    if (!this.canControl) return

    if (this.selectedItems.length > 0) {
      this.dialogSvc
        .verify({ body: this.$t.instant('messages.confirmCommand') })
        .subscribe((res) => {
          if (res) {
            const { operator, reason } = res
            if (this.selectedItems.length > 0) {
              this.messageSvc
                .sendVehicleCommand(
                  {
                    action: 'pm',
                    user: operator,
                    note: reason,
                  },
                  this.selectedItems,
                )
                .subscribe()
            }
          }
        })
    }
  }

  get isMobile(){
    return this.mobileSvc.isMobile
  }
}
