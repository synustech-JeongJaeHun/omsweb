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
import { PermissionEnums } from '../../../models/enums';

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

  enableRows: IVehicleStatusRow[] = [];
  disableRows: IVehicleStatusRow[] = [];

  //#region Subscriptions
  private destroy$: Subject<void> = new Subject<void>();
  //#endregion

  readonly permissionEnums: typeof PermissionEnums = PermissionEnums;

  get hasControlAccess(): boolean {
    return this.auth.isAuthenticated;
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
    this.hubSvc.vehicleTableChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e: IDataChangeEvent) => {
        e && this.onTableChanged(e);
      });
  }

  hasPermission(permission: number): boolean {
    return AccountUtil.hasPermission(permission, this.auth.currentUser);
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
    this.enableRows = [];
    this.disableRows = [];
    for (let index in this.selectedItems) {
      if (this.selectedItems[index].hostOrder)
        this.disableRows.push(this.selectedItems[index]);
      else
        this.enableRows.push(this.selectedItems[index]);
    }
    if (this.enableRows.length > 0) {
      this.messageSvc
        .sendVehicleCommand({ action: 'set_behavior', hostOrder: true }, this.enableRows)
        .subscribe();
    }
    if (this.disableRows.length > 0) {
      this.messageSvc
        .sendVehicleCommand({ action: 'set_behavior', hostOrder: false }, this.disableRows)
        .subscribe();
    }
  }
  onChangePushActivity() {
    if (!this.canControl) return;
    this.enableRows = [];
    this.disableRows = [];
    for (let index in this.selectedItems) {
      if (this.selectedItems[index].canBePushed)  // now enable --> to disable
        this.disableRows.push(this.selectedItems[index]);
      else
        this.enableRows.push(this.selectedItems[index]);
    }
    if (this.enableRows.length > 0) {
      this.messageSvc
        .sendVehicleCommand({ action: 'set_behavior', canBePushed: true }, this.enableRows)
        .subscribe();
    }

    if (this.disableRows.length > 0) {
      this.messageSvc
        .sendVehicleCommand({ action: 'set_behavior', canBePushed: false }, this.disableRows)
        .subscribe();
    }
  }
  onRailIn() {
    if (!this.canControl) return;
    this.messageSvc
      .sendVehicleCommand({ action: 'rail_in' }, this.selectedItems)
      .subscribe();
  }
  onRailOut() {
    if (!this.canControl) return;
    this.messageSvc
      .sendVehicleCommand({ action: 'rail_out' }, this.selectedItems)
      .subscribe();
  }

  private onTableChanged(payload: IDataChangeEvent) {
    //console.log('@@ vehicle table updated >', payload);
    let needReload = false;
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
    needReload && this.dataSource.reload().then((data) => {
      this.selectedRows = [];
      for (let index in this.selectedItems) {
        this.selectedRows[index] = this.selectedItems[index].id;
      }
    });
  }
}
