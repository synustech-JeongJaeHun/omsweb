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
import { forkJoin, merge, Subject, Subscription } from 'rxjs'
import DataSource from 'devextreme/data/data_source'

import { StatusService } from '../../../services/status.service'
import { SettingsService } from '../../../services/settings.service'
import { TrackIdService } from '../../../services/track-id.service'
import { HubService } from '../../../services/hub.service'
import { IDataChangeEvent } from '../../../models/notification.model'
import { AuthService } from '../../../services/auth.service'
import { AccountUtil } from '../../shared/utils/account.util'
import { auditTime, takeUntil } from 'rxjs/operators'
import { MessagesService } from '../../../services/messages.service'
import { DxDataGridComponent } from 'devextreme-angular'
import { PermissionEnums } from '../../../models/enums'
import { ClientPreferences } from '../../../models/settings.model'
import { AuditTimeDuration } from './constants'
import { TranslateService } from '@ngx-translate/core'
import { DialogService } from '@oms/root/services/dialog.service'
import { TransfersService } from '@oms/root/services/transfers.service'
import { IOrderStatusRow } from '../../../models/order-status.model'
import { TrackStatusService } from '@oms/root/services/track-status.service'

@Component({
	selector: 'oms-order-control-table',
	templateUrl: './order-control-table.component.html',
	styleUrls: ['./order-control-table.component.scss'],
})
export class OrderControlTableComponent implements OnInit, OnDestroy {
	@Output() focus = new EventEmitter<{
		type: string
		id: number
		focusType?: string
	}>()
	@Output() dropFocus = new EventEmitter<{ focusType?: string }>()

	@Input() tableHeight: number
	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent

	dataSource: DataSource
	// dataSource: any;
	selectedRows: number[] = []
	preference: ClientPreferences

	private color_normal: string = 'rgba(255, 255, 255, 1.0)'
	private color_warning: string = 'rgba(255, 210, 0, 0.5)'

	//#region Subscriptions
	private destroy$: Subject<void> = new Subject<void>()
	//#endregion

	get hasControlAccess(): boolean {
		return (
			this.auth.isAuthenticated &&
			//AccountUtil.hasPermission(11, this.auth.currentUser)
			AccountUtil.hasPermission(
				PermissionEnums.DeleteOrder,
				this.auth.currentUser,
			)
		)
	}

	get canDelete(): boolean {
		return this.selectedRows.length > 0
	}

	get canUpdate(): boolean {
		return this.selectedRows.length == 1
	}

	transformVehicleId = ({ value = '' }): string => {
		const text =
			this.idSvc.get_alternative_id('vehicle', 'logicalId', value) || value
		return text.toString()
	}

	transformLocationId = ({ value = '' }): string => {
		return this.idSvc.guessLocationId(value)
	}

	getBgColor(type: number, value: string): string {
		return this.getColor_Status(value) // Status
	}

	private getColor_Status(value: string): string {
		if (value != null && value !== undefined) {
			if (value?.includes('transfer') && value?.includes('delayed'))
				return this.color_warning
		}
		return this.color_normal
	}

	constructor(
		private auth: AuthService,
		private statusSvc: StatusService,
		private settingSvc: SettingsService,
		private messageSvc: MessagesService,
		private idSvc: TrackIdService,
		private hubSvc: HubService,
		private dialogSvc: DialogService,
		private transferSvc: TransfersService,
		private t$: TranslateService,
		private trackStatusService: TrackStatusService,
	) {
		this.dataSource = this.statusSvc.orderStatusDataSource()
		this.preference = this.settingSvc.globalPreferences
	}

	canDisplayTable(type: string): boolean {
		return this.preference.controlTables[type]
	}
	getDisplayTableColumnIndex(type: string): number {
		return this.preference.controlTables.orders_order.findIndex(
			(column) => column.name === type,
		)
	}

	getDisplayTableColumnWidth(type: string) {
		return this.preference.controlTables.orders_order.find(
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
					this.preference.controlTables.orders_order[c.visibleIndex]
				if (column) column.width = c.width
			})

			this.preference.save()
		},
	}

	ngOnDestroy(): void {
		this.dropFocus.emit({ focusType: 'CARRIER' })
		this.destroy$.next()
		this.destroy$.complete()
	}

	ngOnInit(): void {
		this.hubSvc.orderTableChanged$
			.pipe(takeUntil(this.destroy$), auditTime(AuditTimeDuration))
			.subscribe((e: IDataChangeEvent) => {
				e && this.onTableChanged(e)
			})
	}

	onDelete() {
		if (!this.canDelete) return
		const items = this.dataGrid.instance.getSelectedRowsData()
		const jobs = items.map((x) => this.messageSvc.sendDeleteOrder(x))
		forkJoin(jobs).subscribe()
	}

	onUpdate(destInput: string) {
		if (!this.canUpdate || !destInput) return

		let orders: IOrderStatusRow[] = this.dataGrid.instance.getSelectedRowsData()
		let commandID: string = orders[0].logicalId

		this.transferSvc.checkUpdate(commandID, destInput).subscribe((res) => {
			console.log(res)

			if (res.hcack === 0 || res.hcack === 4) {
				const items = this.dataGrid.instance.getSelectedRowsData()
				const jobs = items.map((x) =>
					this.messageSvc.sendUpdateOrder(x, destInput),
				)
				forkJoin(jobs).subscribe()

				this.dialogSvc.success({
					title: this.t$.instant('names.success'),
					body: this.t$.instant(errorMessage),
				})
			} else {
				var errorMessage = ''
				if (res.hcack === 2) errorMessage = 'messages.confirmNotAbleToExcute'
				else if (res.hcack === 3) {
					if (res.cpname === 'DESTPORT')
						errorMessage = 'messages.confirmParameterInvalidDest'
					else errorMessage = 'messages.confirmParameterInvalid'
				} else if (res.hcack === 5) errorMessage = 'messages.confirmReject'
				else errorMessage = 'messages.confirmNotAbleToExcute'

				this.dialogSvc.alert({
					title: this.t$.instant('names.failed'),
					body: this.t$.instant(errorMessage),
				})
			}
		})
	}

	isTrackingCarrier = false
	trackingCarrierInfo = {
		orderId: null,
		carrierId: null,
		type: null,
		logicalId: null,
	}
	trackingCarrierOrderSubscription: Subscription | null = null
	trackingCarrierVehicleAndBufferSubscription: Subscription | null = null
	onChangeIsTrackingCarrier(event: { checked: boolean }) {
		this.isTrackingCarrier = event.checked
		if (this.isTrackingCarrier === false) this.stopTrackCarrier()
	}
	onClickTransferRow(event: { data: { id: number; carrierLabel?: string } }) {
		if (this.isTrackingCarrier === false) return

		const carrierId = event.data.carrierLabel
		const orderId = event.data.id

		const isCarrierNullish = carrierId == null || carrierId.length === 0
		const isOrderSame = this.trackingCarrierInfo.orderId === orderId

		if (isCarrierNullish || isOrderSame) {
			this.stopTrackCarrier()
		} else {
			this.stopTrackCarrier()
			this.trackCarrier(orderId, carrierId)
		}
	}
	private trackCarrier(orderId: number, carrierId: string) {
		this.trackingCarrierInfo = {
			orderId,
			carrierId,
			type: null,
			logicalId: null,
		}

		this.trackingCarrierOrderSubscription = this.hubSvc.orderTableChanged$
			.pipe(takeUntil(this.destroy$), auditTime(AuditTimeDuration))
			.subscribe((e) => {
				const orderId = e.id
				if (this.trackingCarrierInfo.orderId !== orderId) return

				this.transferSvc
					.getTransferById(this.trackingCarrierInfo.orderId)
					.subscribe(
						// on success
						(data) => {
							if (data.timeCompleted || data.timeAborted || data.timeFailed) {
								this.stopTrackCarrier()
							}
						},
						// on fail
						() => this.stopTrackCarrier(),
					)
			})

		const searchCarrierInVehiclesAndBuffers = () => {
			const vhl = (this.trackStatusService?.trackData?.vehicles ?? []).find(
				(v) => v.carrierId === this.trackingCarrierInfo.carrierId,
			)
			if (vhl) {
				this.focus.emit({ type: 'vehicle', id: vhl.id, focusType: 'CARRIER' })
				this.trackingCarrierInfo.type = 'Vehicle'
				this.trackingCarrierInfo.logicalId = vhl.logicalId
				return
			}

			const buffer = (this.trackStatusService?.trackData?.buffers ?? []).find(
				(b) => b.carrierId === this.trackingCarrierInfo.carrierId,
			)
			if (buffer) {
				this.focus.emit({
					type: 'buffer',
					id: buffer.id,
					focusType: 'CARRIER',
				})
				this.trackingCarrierInfo.type = 'Buffer'
				this.trackingCarrierInfo.logicalId = buffer.logicalId
				return
			}

			this.trackingCarrierInfo.type = null
			this.trackingCarrierInfo.logicalId = null
			this.dropFocus.emit({ focusType: 'CARRIER' })
		}
		this.trackingCarrierVehicleAndBufferSubscription = merge(
			this.hubSvc.vehicleTableChanged$,
			this.hubSvc.bufferChanged$,
		)
			.pipe(takeUntil(this.destroy$), auditTime(AuditTimeDuration))
			.subscribe(searchCarrierInVehiclesAndBuffers)

		searchCarrierInVehiclesAndBuffers()
	}
	private stopTrackCarrier() {
		this.trackingCarrierOrderSubscription?.unsubscribe()
		this.trackingCarrierOrderSubscription = null
		this.trackingCarrierVehicleAndBufferSubscription?.unsubscribe()
		this.trackingCarrierVehicleAndBufferSubscription = null

		this.trackingCarrierInfo = {
			orderId: null,
			carrierId: null,
			type: null,
			logicalId: null,
		}

		this.dropFocus.emit({ focusType: 'CARRIER' })
	}

	private onTableChanged(payload: IDataChangeEvent) {
		this.dataSource.reload().then((data) => {
			this.dataGrid.instance.refresh()
		})
	}

	@HostListener('document:visibilitychange', ['$event'])
	private visibilitychange() {
		if (!document.hidden) {
			this.dataSource.reload().then((data) => {
				this.dataGrid.instance.refresh()
			})
		}
	}
}
