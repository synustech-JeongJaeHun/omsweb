import {
  Component,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core'
import DataSource from 'devextreme/data/data_source'

import { IZcuStatusRow } from '../../../models/zcu-status.model'
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
import { DialogService } from '../../../services/dialog.service'
import { TranslateService } from '@ngx-translate/core'
import { AuditTimeDuration } from './constants'

@Component({
  selector: 'oms-zcu-control-table',
  templateUrl: './zcu-control-table.component.html',
  styleUrls: ['./zcu-control-table.component.scss'],
})
export class ZcuControlTableComponent implements OnInit, OnDestroy {
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

  get selectedItems(): IZcuStatusRow[] {
    return this.dataGrid.instance.getSelectedRowsData()
  }

  constructor(
    private auth: AuthService,
    private statusSvc: StatusService,
    private settingSvc: SettingsService,
    private messageSvc: MessagesService,
    private dialogSvc: DialogService,
    private $t: TranslateService,
    private hubSvc: HubService,
  ) {
    this.dataSource = this.statusSvc.zcuStatusDataSource()
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
    this.hubSvc.zcuStatusTableChanged$
      .pipe(takeUntil(this.destroy$), auditTime(AuditTimeDuration))
      .subscribe((e: IDataChangeEvent) => {
        e && this.onTableChanged(e)
      })
  }

  onReset() {
    if (!this.canReset) return

    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmZcuReset') })
      .subscribe((confirm) => {
        if (confirm) {
          this.messageSvc
            .sendZcuCommand({
              action: 'zcu_reset',
              zcuIds: this.selectedRows,
            })
            .subscribe()
        }
      })
  }

  onSetHw() {
    if (!this.canReset) return

    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmZcuChange') })
      .subscribe((confirm) => {
        if (confirm) {
          this.messageSvc
            .sendSettingZcuCommand({
              action: 'zcu-setting',
              zcuIds: this.selectedRows,
              zcuUsingType: 'hw',
            })
            .subscribe()
        }
      })
  }

  onSetSw() {
    if (!this.canReset) return

    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmZcuChange') })
      .subscribe((confirm) => {
        if (confirm) {
          this.messageSvc
            .sendSettingZcuCommand({
              action: 'zcu-setting',
              zcuIds: this.selectedRows,
              zcuUsingType: 'sw',
            })
            .subscribe()
        }
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
