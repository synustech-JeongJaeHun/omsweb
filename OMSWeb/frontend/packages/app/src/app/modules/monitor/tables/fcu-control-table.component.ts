import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DxDataGridComponent} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import {ClientPreferences} from "../../../models/settings.model";
import {Subject} from "rxjs";
import {IZcuStatusRow} from "../../../models/zcu-status.model";
import {AuthService} from "../../../services/auth.service";
import {StatusService} from "../../../services/status.service";
import {SettingsService} from "../../../services/settings.service";
import {MessagesService} from "../../../services/messages.service";
import {DialogService} from "../../../services/dialog.service";
import {TranslateService} from "@ngx-translate/core";
import {HubService} from "../../../services/hub.service";
import {auditTime, takeUntil} from "rxjs/operators";
import {AuditTimeDuration} from "./constants";
import {IDataChangeEvent} from "../../../models/notification.model";

@Component({
  selector: 'oms-fcu-control-table',
  templateUrl: './fcu-control-table.component.html',
  styles: [`
    .grid-actions {
        position: absolute;
        display: flex;
        z-index: 1;
        top: 5px;
    }

    button {
      margin-right: 5px;
    }
    dx-data-grid{
      max-width: 100vw !important;
    }
  `]
})
export class FcuControlTableComponent implements OnInit, OnDestroy {

  @Input() tableHeight: number
  @Input() isOpen: boolean
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent

  dataSource: DataSource
  selectedRows: number[] = []

  preference: ClientPreferences

  private color_normal: string = 'rgba(240, 255, 255, 1.0)'
  private color_error: string = 'rgba(255, 0, 0, 0.5)'

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
    this.dataSource = this.statusSvc.fcuStatusDataSource()
    this.preference = this.settingSvc.globalPreferences
  }

  canDisplayTable(type: string): boolean {
    return this.preference.controlTables[type]
  }

  getDisplayTableColumnIndex(type: string): number {
    return this.preference.controlTables.fcus_order.findIndex(
      (column) => column.name === type,
    )
  }

  getDisplayTableColumnWidth(type: string) {
    return this.preference.controlTables.fcus_order.find(
      (column) => column.name === type,
    )?.width
  }

  getDisplayTableLabel(type: string): string {
    return this.preference.controlTables.fcus_order.find(
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
        const column = this.preference.controlTables.fcus_order[c.visibleIndex]
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
    this.hubSvc.fireShutterMapChanged$
      .pipe(auditTime(AuditTimeDuration), takeUntil(this.destroy$))
      .subscribe((e: IDataChangeEvent) => {
        this.isOpen &&e && this.onTableChanged(e)
      })
  }

  getBgColor(type: number, value: string): string {
    return this.getColor_Status(value) // Status
  }

  private getColor_Status(value: string): string {
    if (value === 'Normal') return this.color_normal
    else if (value === 'Error') return this.color_error
    return this.color_normal
  }

  private onTableChanged(payload: IDataChangeEvent) {
    this.dataSource.reload()
  }

  @HostListener('document:visibilitychange', ['$event'])
  private visibilitychange() {
    if (!document.hidden) this.dataSource.reload()
  }
}
