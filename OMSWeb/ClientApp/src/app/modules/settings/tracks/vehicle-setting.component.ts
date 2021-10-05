import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular'
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { SettingsService } from '../../../services/settings.service';
import { MessagesService } from '../../../services/messages.service';
import { ISettingsVehicleReg } from '../../../models/settings.model';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { VehicleFormDialogComponent } from '../dialogs/vehicle-form-dialog.component';
import { UserFormDialogComponent } from '../dialogs/user-form-dialog.component';
import { DialogService } from '../../../services/dialog.service';
import { filter, map, tap } from 'rxjs/operators';
import _ = require('lodash');

@Component({
  selector: 'oms-vehicle-setting',
  templateUrl: './vehicle-setting.component.html',
  styleUrls: ['./vehicle-setting.component.scss'],
})
export class VehicleSettingComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false }) dataGrid: DxDataGridComponent;
  private _vehicleDlg: MatDialogRef<VehicleFormDialogComponent>;

  private _changedItems: any[] = [];
  private _removeItems: any[] = [];

  dataSource: ISettingsVehicleReg[];

  removeIds$ = new BehaviorSubject<number[]>([]);
  selectedIds: number[] = [];


  get canRemove(): boolean {
    return this.selectedIds.length > 0;
  }

  get isUpdated(): boolean {
    return this._changedItems.length > 0 || this._removeItems.length > 0;
  }

  constructor(
    private settingsSvc: SettingsService,
    private messageSvc: MessagesService,
    private dialog: MatDialog,
    private dialogSvc: DialogService,
    private t$: TranslateService,
  ) {
    this.settingsSvc.settingsVehicles().subscribe((res) => {
      this.dataSource = res;
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this._vehicleDlg &&
      this._vehicleDlg.getState() === MatDialogState.OPEN &&
      this._vehicleDlg.close();
  }

  onAddVehicle(grid) {
    this._vehicleDlg = this.dialog.open(VehicleFormDialogComponent, {
      width: '350px',
      hasBackdrop: true,
      disableClose: true,
      closeOnNavigation: true,
      data: this.dataSource
    });

    this._vehicleDlg.afterClosed().subscribe((res) => {
      if (res) {
        res.isNew = true;

        this._changedItems.push(res);
        this.selectedIds.push(res.id);

        grid.instance
          .getDataSource()
          .store()
          .push([{ type: 'insert', data: res }]);
      }
    });
  }

  onRemoveVehicles() {
    this.dialogSvc
      .confirm({ body: this.t$.instant('messages.confirmCommand') })
      .subscribe((ok) => {
        if (ok) {
          this.removeIds$.next(this.selectedIds);
          for (let selectedId of this.selectedIds)
            this._removeItems.push(selectedId);
          const canceled = this._changedItems
            .filter((u) => u.isNew && this.selectedIds.includes(u.id))
            .map((u) => u.id);
          if (canceled && canceled.length > 0) {
            this._removeItems = _.difference(this.selectedIds, canceled);
            this._changedItems = this._changedItems.filter(
              (u) => !canceled.includes(u.id)
            );
          }
          // Grid에서 제거
          for (let selectedId of this.selectedIds)
            this.dataGrid.instance.deleteRow(this.dataGrid.instance.getRowIndexByKey(selectedId));

          this.selectedIds = [];
        }
      });
  }

  onUpdateRow(e) {
    const { data, key } = e;
    if (this._changedItems.some((c) => c.id === key)) {
      let vehicle = this._changedItems.find((u) => u.id === key);
      vehicle.logicalId = data.logicalId;
    } else {
      let vehicle = data;
      this._changedItems.push(vehicle);
      this.selectedIds.push(vehicle.id);
    }
  }

  onSelectionChanged(e) {
    //e.selectedRowKeys[0];
    //this.selectedIds.push(e.selectedRowKeys[0]);
    this.selectedIds = this.selectedIds.filter((x) => x !== undefined);
  }

  onSave(grid) {
    const jobs: Observable<void>[] = [];
    //this._changedItems.length &&
    //  jobs.push(this.settingsSvc.saveVehicleRegs(this._changedItems));
    if (this._removeItems.length > 0)
      this.RemoveMessages(this._removeItems);

    if (this._changedItems.length > 0)
      this.SaveMessages(this._changedItems);

    this._removeItems = [];
    this._changedItems = [];
    grid.instance.refresh();
  }

  onRevert(grid) {
    this.selectedIds = [];
    this._changedItems = [];
    grid.instance.refresh();

    this.settingsSvc.settingsVehicles().subscribe((res) => {
      this.dataSource = res;
    });
  }

  RemoveMessages(items: any[]): Observable<void> {
    // 개별 삭제 메시지 전송
    for (let idx = 0; idx < items.length; idx++) {
      this.messageSvc
        .sendVehicleRegRemoveCommand({ type: 'VEHICLE', action: 'vehicle_reg_remove', vehicleId: items[idx] })
        .subscribe();
    }

    // 일괄 삭제 메시지 전송
    this.messageSvc
      .sendVehicleRegRemoveCommand({ type: 'VEHICLE', action: 'vehicle_reg_remove', vehicleIds: items })
      .subscribe();

    return;
  }

  SaveMessages(items: any[]): Observable<void> {
    // 개별 수정/추가 메시지 전송
    for (let idx = 0; idx < items.length; idx++) {
      if (items[idx].isNew) {
        this.messageSvc
          .sendVehicleRegAddCommand({ type: 'VEHICLE', action: 'vehicle_reg_add', vehicleId: items[idx].id, logicalId: items[idx].logicalId })
          .subscribe();
      } else {
        this.messageSvc
          .sendVehicleRegUpdateCommand({ type: 'VEHICLE', action: 'vehicle_reg_update', vehicleId: items[idx].id, logicalId: items[idx].logicalId })
          .subscribe();
      }
    }

    return;
  }
}
