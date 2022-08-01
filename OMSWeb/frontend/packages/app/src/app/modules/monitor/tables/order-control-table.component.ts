import {
	Component,
	HostListener,
	Input,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core'
import { forkJoin, Subject } from 'rxjs'
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

@Component({
	selector: 'oms-order-control-table',
	templateUrl: './order-control-table.component.html',
	styleUrls: ['./order-control-table.component.scss'],
})
export class OrderControlTableComponent implements OnInit, OnDestroy {
	@Input() tableHeight: number
	@ViewChild(DxDataGridComponent, { static: false })
	dataGrid: DxDataGridComponent

	dataSource: DataSource
	// dataSource: any;
    selectedRows: number[] = []
    preference: ClientPreferences

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

	constructor(
		private auth: AuthService,
		private statusSvc: StatusService,
		private settingSvc: SettingsService,
		private messageSvc: MessagesService,
		private idSvc: TrackIdService,
        private hubSvc: HubService,
        private dialogSvc: DialogService,
        private $t: TranslateService,
        private transferSvc: TransfersService,
        private t$: TranslateService,
	) {
		this.dataSource = this.statusSvc.orderStatusDataSource()
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

      let orders: IOrderStatusRow[] = this.dataGrid.instance.getSelectedRowsData();
      let commandID: string = orders[0].logicalId;

      this.transferSvc.checkUpdate(commandID, destInput)
        .subscribe((res) => {
          console.log(res);

          if (res.hcack === 0 || res.hcack === 4) {
            const items = this.dataGrid.instance.getSelectedRowsData()
            const jobs = items.map((x) => this.messageSvc.sendUpdateOrder(x, destInput))
            forkJoin(jobs).subscribe()

            this.dialogSvc.success({
              title: this.t$.instant('names.success'),
              body: this.t$.instant(errorMessage),
            })
          }
          else {
            var errorMessage = "";
            if (res.hcack === 2) errorMessage = 'messages.confirmNotAbleToExcute';
            else if (res.hcack === 3) {
              if (res.cpname === 'DESTPORT') errorMessage = 'messages.confirmParameterInvalidDest';
              else errorMessage = 'messages.confirmParameterInvalid';
            }
            else if (res.hcack === 5) errorMessage = 'messages.confirmReject';
            else errorMessage = 'messages.confirmNotAbleToExcute';

            this.dialogSvc.alert({
              title: this.t$.instant('names.failed'),
              body: this.t$.instant(errorMessage),
            })
          }
        })
    }

	private onTableChanged(payload: IDataChangeEvent) {
      this.dataSource.reload().then((data) => {
         this.dataGrid.instance.refresh();
      })
	}

	@HostListener('document:visibilitychange', ['$event'])
	private visibilitychange() {
        if (!document.hidden) {
          this.dataSource.reload().then((data) => {
             this.dataGrid.instance.refresh();
          })
        }
	}
}
