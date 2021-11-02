import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import DataSource from 'devextreme/data/data_source';

import { StatusService } from '../../../services/status.service';
import { SettingsService } from '../../../services/settings.service';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { HubService } from '../../../services/hub.service';
import { IDataChangeEvent } from '../../../models/notification.model';
import { UserPermissions } from '../../../models/enums';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '../../shared/utils/account.util';
import { takeUntil } from 'rxjs/operators';
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

  get canDelete(): boolean {
    return this.selectedRows.length > 0;
  }

  constructor(
    private auth: AuthService,
    private statusSvc: StatusService,
    private settingSvc: SettingsService,
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
    this.hubSvc.orderTableChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e: IDataChangeEvent) => {
        e && this.onTableChanged(e);
      });
  }

  onDelete() {
    if (!this.canDelete) return;
    const items = this.dataGrid.instance.getSelectedRowsData();
    const jobs = items.map((x) => this.messageSvc.sendDeleteOrder(x));
    forkJoin(jobs).subscribe();
  }

  private onTableChanged(payload: IDataChangeEvent) {
    let needReload = false;
    console.log('@@ station table updated >>>', payload);
    if (payload && payload.id && payload.operation) {
      if (['INSERT', 'DELETE'].includes(payload.operation)) {
        needReload = true;
      } else {
        needReload = this.dataSource.items().every((x) => x.id !== payload.id);
        // needReload = true;
      }
    } else {
      needReload = true;
    }
    needReload && this.dataSource.reload();
  }
}
