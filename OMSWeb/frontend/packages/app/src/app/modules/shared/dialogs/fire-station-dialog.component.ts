import {Component, EventEmitter, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DxDataGridComponent} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import {DateUtil} from "../utils/date.util";
import {ClientPreferences} from "../../../models/settings.model";
import {forkJoin, merge, Subject} from "rxjs";
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
import {IOrderStatusRow} from "@oms/models/order-status.model";
import {TransfersService} from "@oms/services/transfers.service";

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

  includesWords  = []

  selectRowData = null;

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
    private transferSvc: TransfersService,
  ) {

    this.preference = this.settingSvc.globalPreferences
    settingSvc.serviceConfig.subscribe(
      (config) => {

        const fireStationFilters = config.fireStationFilters
        this.includesWords = [
          ...fireStationFilters?.startWords,
          ...fireStationFilters?.endWords,
          ...fireStationFilters?.includeWords]

        this.dataSource = this.statusSvc.fireStationStatusDataSource(this.includesWords)
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

  includeCheck(word: string){
    return this.includesWords.some(i=>word.includes(i))
  }

  onRemoveCarrierStation(carrierId: string) {
    const data = this.dataGrid.instance.getSelectedRowsData()[0];
    if (!data?.logicalId) return;

    if(!this.includeCheck(data?.logicalId)){
      this.dialogSvc.alert({
        title: this.$t.instant('names.failed'),
        body: this.$t.instant('messages.confirmNotAbleToExcute'),
      })
    }

    this.transferSvc
      .checkCarrierChange(
        'remove',
        data.logicalId,
        'station',
        carrierId,
        'none',
      )
      .subscribe((res) => {
        if (res.hcack === 0 || res.hcack === 4) {
          this.messageSvc
            .sendCarrierCommand({
              action: 'remove_carrier',
              carrierLabel: carrierId,
              logicalId: data.logicalId,
            })
            .subscribe()

          this.dialogSvc.success({
            title: this.$t.instant('names.success'),
            body: this.$t.instant('messages.confirmSuccessRemoveCarrier'),
          }).subscribe()
        } else {
          let errorMessage = ''
          if (res.hcack === 2) errorMessage = 'messages.confirmNotAbleToExcute'
          else if (res.hcack === 3) {
            if (res.cpname === 'CARRIERID')
              errorMessage = 'messages.confirmParameterInvalidCarrierID'
            else if (res.cpname === 'CARRIERLOC')
              errorMessage = 'messages.confirmParameterInvalidCarrierLoc'
            else errorMessage = 'messages.confirmParameterInvalid'
          } else if (res.hcack === 5) errorMessage = 'messages.confirmReject'
          else errorMessage = 'messages.confirmNotAbleToExcute'

          this.dialogSvc.alert({
            title: this.$t.instant('names.failed'),
            body: this.$t.instant(errorMessage),
          })
        }
      })
  }

  cellSelected(e){
    this.dataGrid.instance.deselectAll()
    this.dataGrid.instance.selectRowsByIndexes(e.rowIndex)
    this.selectRowData = this.dataGrid.instance.getSelectedRowsData()[0];

  }
}
