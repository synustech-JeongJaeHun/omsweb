import {Component, EventEmitter, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DxDataGridComponent} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import {DateUtil} from "../utils/date.util";
import {ClientPreferences} from "../../../models/settings.model";
import {merge, Subject} from "rxjs";
import {AuthService} from "../../../services/auth.service";
import {StatusService} from "../../../services/status.service";
import {SettingsService} from "../../../services/settings.service";
import {HubService} from "../../../services/hub.service";
import {TrackStatusService} from "../../../services/track-status.service";
import {auditTime, takeUntil} from "rxjs/operators";
import {AuditTimeDuration} from "../../monitor/tables/constants";
import {IDataChangeEvent} from "../../../models/notification.model";
import {MessagesService} from "@oms/services/messages.service";
import {DialogService} from "@oms/services/dialog.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'oms-fire-station-dialog',
  templateUrl: './fire-station-dialog.component.html',
  styles: [
  ]
})
export class FireStationDialogComponent implements OnInit, OnDestroy {
  @Input() findAndFocus: EventEmitter<{ type: string; id: number }>

  @ViewChild(DxDataGridComponent, { static: false })

  dataGrid: DxDataGridComponent
  dataSource: DataSource

  dateTimeFormat = DateUtil.DateTimeFormat

  preference: ClientPreferences

  selectedRows: number[] = []

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
    private messageSvc: MessagesService,
    private dialogSvc: DialogService,
    private $t: TranslateService,
  ) {

    this.preference = this.settingSvc.globalPreferences
    settingSvc.serviceConfig.subscribe(
      (config) => {

        const fireStationFilters = config.fireStationFilters
        const words = [
          ...fireStationFilters?.startWords,
          ...fireStationFilters?.endWords,
          ...fireStationFilters?.includeWords]

        this.dataSource = this.statusSvc.fireStationStatusDataSource(words)
      },
    )
  }

  ngOnInit() {
    this.hubSvc.stationChanged$
      .pipe(auditTime(AuditTimeDuration), takeUntil(this.destroy$))
      .subscribe((e: IDataChangeEvent) => {
        e && this.onTableChanged(e)
      })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  private onTableChanged(payload: IDataChangeEvent) {
    this.dataSource.reload()
  }

  onFocusedChanging($event){
    console.log($event)
    $event.cancel =true
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

  get canControl(): boolean {
    return this.selectedRows.length > 0
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
}
