import { Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import DataSource from 'devextreme/data/data_source';

import { StatusService } from '../../../services/status.service';
import { SettingsService } from '../../../services/settings.service';
import { forkJoin, Subject } from 'rxjs';
import { HubService } from '../../../services/hub.service';
import { IDataChangeEvent } from '../../../models/notification.model';
import { AuthService } from '../../../services/auth.service';
import { takeUntil } from 'rxjs/operators';
import { DialogService } from '../../../services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { MessagesService } from '../../../services/messages.service';
import { DxDataGridComponent } from 'devextreme-angular';
import { ClientPreferences } from '../../../models/settings.model';

@Component({
  selector: 'oms-station-control-table',
  templateUrl: './station-control-table.component.html',
  styleUrls: ['./station-control-table.component.scss'],
})
export class StationControlTableComponent implements OnInit, OnDestroy {
  @Input() tableHeight: number;
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  dataSource: DataSource;
  selectedRows: number[] = [];

  preference: ClientPreferences;

  //#region Subscriptions
  private destroy$: Subject<void> = new Subject<void>();
  //#endregion

  get hasControlAccess(): boolean {
    return (
      this.auth.isAuthenticated
    );
  }

  get canControl(): boolean {
    return this.selectedRows.length > 0;
  }

  constructor(
    private auth: AuthService,
    private statusSvc: StatusService,
    private settingSvc: SettingsService,
    private dialogSvc: DialogService,
    private $t: TranslateService,
    private messageSvc: MessagesService,
    private hubSvc: HubService
  ) {
    this.dataSource = this.statusSvc.stationStatusDataSource();
    this.preference = this.settingSvc.globalPreferences;
  }

  canDisplayTable(type: string): boolean {
    return this.preference.controlTables[type];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.hubSvc.stationChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e: IDataChangeEvent) => {
        e && this.onTableChanged(e);
      });
  }

  onUnuse() {
    if (!this.canControl) return;

    let stationIds: number[] = [];
    const items = this.dataGrid.instance.getSelectedRowsData();
    for (let idx = 0; idx < items.length; idx++) {
        stationIds.push(items[idx].id);
    }

    if (stationIds.length > 0) {
        this.dialogSvc
          .confirm({ body: this.$t.instant('messages.confirmCommand') })
          .subscribe((ok) => {
            ok &&
            this.messageSvc
              .sendStationSettingCommand({type:'UNUSE', action: 'station-setting', unused: 1}, stationIds)
              .subscribe();
          });
     }
  }

  onUse() {
    if (!this.canControl) return;
    
    let stationIds: number[] = [];
    const items = this.dataGrid.instance.getSelectedRowsData();
    for (let idx = 0; idx < items.length; idx++) {
        stationIds.push(items[idx].id);
    }

    if (stationIds.length > 0) {
        this.dialogSvc
          .confirm({ body: this.$t.instant('messages.confirmCommand') })
          .subscribe((ok) => {
            ok &&
            this.messageSvc
              .sendStationSettingCommand({type: 'USE', action: 'station-setting', unused: 0}, stationIds)
              .subscribe();
          });
     }
  }

  private onTableChanged(payload: IDataChangeEvent) {
    let needReload = false;
    console.log('@@ station table updated >>>', payload);
    if (payload && payload.id && payload.operation) {
      if (['INSERT', 'DELETE'].includes(payload.operation)) {
        needReload = true;
      } else {
        needReload = this.dataSource.items().every((x) => x.id !== payload.id);
        needReload = true;
      }
    } else {
      needReload = true;
    }
    needReload && this.dataSource.reload();
  }

  @HostListener('document:visibilitychange', ['$event'])
  private visibilitychange() {
    if (!document.hidden) this.dataSource.reload();
  }
}
