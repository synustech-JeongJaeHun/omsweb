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
import { DateUtil } from '../../shared/utils/date.util'
import { TrackStatusService } from '@oms/root/services/track-status.service'

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
			.pipe(takeUntil(this.destroy$), auditTime(AuditTimeDuration))
			.subscribe((e: IDataChangeEvent) => {
				e && this.onTableChanged(e)
			})
	}

	ngOnDestroy() {
		this.destroy$.next()
		this.destroy$.complete()
	}

	handleClickView = (event: {
		row: { data: { type: string; objectId: number } }
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

	@HostListener('document:visibilitychange', ['$event'])
	private visibilitychange() {
		if (!document.hidden) this.dataSource.reload()
	}
}
