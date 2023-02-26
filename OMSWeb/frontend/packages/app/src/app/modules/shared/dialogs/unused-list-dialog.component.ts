import {
	Component,
	EventEmitter,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core'
import DataSource from 'devextreme/data/data_source'

import { StatusService } from '../../../services/status.service'
import { SettingsService } from '../../../services/settings.service'
import { merge, Subject } from 'rxjs'
import { HubService } from '../../../services/hub.service'
import { IDataChangeEvent } from '../../../models/notification.model'
import { AuthService } from '../../../services/auth.service'
import { auditTime, takeUntil } from 'rxjs/operators'
import { DxDataGridComponent } from 'devextreme-angular'
import { ClientPreferences } from '../../../models/settings.model'
import { AuditTimeDuration } from '../../monitor/tables/constants'
import { DateUtil } from '../utils/date.util'
import { TrackStatusService } from '@oms/root/services/track-status.service'

@Component({
	selector: 'oms-unused-list-dialog',
	templateUrl: './unused-list-dialog.component.html',
	styleUrls: ['./unused-list-dialog.component.scss'],
})
export class UnusedListDialogComponent implements OnInit, OnDestroy {
	@Input() findAndFocus: EventEmitter<{ type: string; id: number }>

	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent
	dataSource: DataSource

	dateTimeFormat = DateUtil.DateTimeFormat

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
		private trackStatusService: TrackStatusService,
	) {
		this.dataSource = this.statusSvc.unuseStatusDataSource()
		this.preference = this.settingSvc.globalPreferences
	}

	ngOnInit() {
		merge(
			this.hubSvc.vehicleTableChanged$,
			this.hubSvc.segmentDisabledChanged$,
			this.hubSvc.stationChanged$,
			this.hubSvc.bufferChanged$,
		)
			.pipe(auditTime(AuditTimeDuration), takeUntil(this.destroy$))
			.subscribe((e: IDataChangeEvent) => {
				e && this.onTableChanged(e)
			})
	}

	ngOnDestroy() {
		this.destroy$.next()
		this.destroy$.complete()
	}

	handleClickView = (event: {
		row: { data: { type: string; objectId: number }, rowIndex: number }
	}) => {
		const typeInLowerCase = event.row.data.type.toLowerCase()
		this.findAndFocus.emit({
			type: typeInLowerCase,
			id: event.row.data.objectId,
		})

	}

	private onTableChanged(payload: IDataChangeEvent) {
		this.dataSource.reload()
	}

  onFocusedChanging($event){
    console.log($event)
    $event.cancel =true
  }
}
