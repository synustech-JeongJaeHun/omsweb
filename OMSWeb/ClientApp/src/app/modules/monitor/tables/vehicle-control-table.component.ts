import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { DxDataGridComponent } from 'devextreme-angular';
import { MessagesService } from '../../../services/messages.service';

@Component({
  selector: 'oms-vehicle-control-table',
  templateUrl: './vehicle-control-table.component.html',
  styleUrls: ['./vehicle-control-table.component.scss'],
})
export class VehicleControlTableComponent implements OnInit, OnDestroy {
  @Input() tableHeight: number;
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  dataSource: DataSource;
  selectedRows: number[] = [];

  //#region Subscriptions
  private destroy$: Subject<void> = new Subject<void>();
  //#endregion

  get hasControlAccess(): boolean {
    return (
      this.auth.isAuthenticated &&
      AccountUtil.hasPermission(
        UserPermissions.controlActions,
        this.auth.currentUser
      )
    );
  }

  get canControl(): boolean {
    return this.selectedRows.length > 0;
  }

  get selectedItems(): IVehicleStatusRow[] {
    return this.dataGrid.instance.getSelectedRowsData();
  }

  constructor(
    private auth: AuthService,
    private statusSvc: StatusService,
    private messageSvc: MessagesService,
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

  onEStop() {
    if (!this.canControl) return;
    this.messageSvc
      .sendVehicleCommand({ action: 'stop' }, this.selectedItems)
      .subscribe();
  }
  onReset() {
    if (!this.canControl) return;
    this.messageSvc
      .sendVehicleCommand({ action: 'reset' }, this.selectedItems)
      .subscribe();
  }
  onSetAuto() {
    if (!this.canControl) return;
    this.messageSvc
      .sendVehicleCommand({ action: 'initialize' }, this.selectedItems)
      .subscribe();
  }
  onChangeHostOrderActivity() {
    if (!this.canControl) return;
  }
  onChangePushActivity() {
    if (!this.canControl) return;
    this.messageSvc
      .sendVehicleCommand({ action: 'set_behavior', canBePushed: true }, this.selectedItems)
      .subscribe();
  }
  onRailIn() {
    if (!this.canControl) return;
  }
  onRailOut() {
    if (!this.canControl) return;
  }

  private onTableChanged(payload: IDataChangeEvent) {
    console.log('@@ vehicle table updated >', payload);
    let needReload = false;
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
