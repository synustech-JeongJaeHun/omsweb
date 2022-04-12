import { Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import DataSource from 'devextreme/data/data_source';

import { StatusService } from '../../../services/status.service';
import { SettingsService } from '../../../services/settings.service';
import { TrackIdService } from '../../../services/track-id.service';
import { HubService } from '../../../services/hub.service';
import { IDataChangeEvent } from '../../../models/notification.model';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '../../shared/utils/account.util';
import { takeUntil } from 'rxjs/operators';
import { MessagesService } from '../../../services/messages.service';
import { DxDataGridComponent } from 'devextreme-angular';
import { PermissionEnums } from '../../../models/enums';
import { ClientPreferences } from '../../../models/settings.model';

@Component({
  selector: 'oms-order-control-table',
  templateUrl: './order-control-table.component.html',
  styleUrls: ['./order-control-table.component.scss'],
})
export class OrderControlTableComponent implements OnInit, OnDestroy {
  @Input() tableHeight: number;
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  dataSource: DataSource;
  // dataSource: any;
  selectedRows: number[] = [];

  preference: ClientPreferences;

  //#region Subscriptions
  private destroy$: Subject<void> = new Subject<void>();
  //#endregion

  get hasControlAccess(): boolean {
    return (
      this.auth.isAuthenticated &&
      //AccountUtil.hasPermission(11, this.auth.currentUser)
      AccountUtil.hasPermission(PermissionEnums.DeleteOrder, this.auth.currentUser)
    );
  }

  get canDelete(): boolean {
    return this.selectedRows.length > 0;
  }

  transformVehicleId = ({ value = '' }): string => {
    const text =
      this.idSvc.get_alternative_id('vehicle', 'logicalId', value) || value;
    return text.toString();
  };

  transformLocationId = ({ value = '' }): string => {
    return this.idSvc.guessLocationId(value);
  };

  constructor(
    private auth: AuthService,
    private statusSvc: StatusService,
    private settingSvc: SettingsService,
    private messageSvc: MessagesService,
    private idSvc: TrackIdService,
    private hubSvc: HubService
  ) {
    this.dataSource = this.statusSvc.orderStatusDataSource();
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
    console.log('@@ order table updated >>>', payload);
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
