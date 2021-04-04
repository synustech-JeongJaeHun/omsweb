import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import DataSource from 'devextreme/data/data_source';

import { IVehicleStatusRow } from '../../../models/vehicle-status.model';
import { StatusService } from '../../../services/status.service';
import { Subject, Subscription } from 'rxjs';
import { HubService } from '../../../services/hub.service';
import { IDataChangeEvent } from '../../../models/notification.model';
import { UserPermissions } from '../../../models/enums';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '../../shared/utils/account.util';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'oms-vehicle-control-table',
  templateUrl: './vehicle-control-table.component.html',
  styleUrls: ['./vehicle-control-table.component.scss'],
})
export class VehicleControlTableComponent implements OnInit, OnDestroy {
  @Input() tableHeight: number;

  dataSource: DataSource;
  selectedRows: IVehicleStatusRow[] = [];

  //#region Subscriptions
  private destroy$: Subject<void> = new Subject<void>();
  //#endregion

  get canControl(): boolean {
    return (
      this.auth.isAuthenticated &&
      AccountUtil.hasPermission(
        UserPermissions.controlActions,
        this.auth.currentUser
      )
    );
  }

  constructor(
    private auth: AuthService,
    private statusSvc: StatusService,
    private hubSvc: HubService
  ) {
    this.dataSource = this.statusSvc.vehicleStatusDataSource();
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

  private onTableChanged(payload: IDataChangeEvent) {
    let needReload = false;
    if (payload && payload.id && payload.operation) {
      if (['INSERT', 'DELETE'].includes(payload.operation)) {
        needReload = true;
      } else {
        needReload = this.dataSource.items().every((x) => x.id !== payload.id);
      }
    } else {
      needReload = true;
    }
    needReload && this.dataSource.reload();
  }
}
