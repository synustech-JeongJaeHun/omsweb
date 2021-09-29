import { Component, OnInit } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { forkJoin, Observable } from 'rxjs';
import { SettingsService } from '../../../services/settings.service';
import { ISettingsVehicleReg } from '../../../models/settings.model';

@Component({
  selector: 'oms-vehicle-setting',
  templateUrl: './vehicle-setting.component.html',
  styleUrls: ['./vehicle-setting.component.scss'],
})
export class VehicleSettingComponent implements OnInit {
  private _changedItems: any[] = [];

  dataSource: ISettingsVehicleReg[];

  selectedIds: number[] = [];

  get isUpdated(): boolean {
    return this._changedItems.length > 0;
  }

  constructor(
    private settingsSvc: SettingsService
  ) {
    this.settingsSvc.settingsVehicles().subscribe((res) => {
      this.dataSource = res;
    });
  }

  ngOnInit(): void {
    this.init();
  }

  onUpdateRow(e) {
    const { data, key } = e;
    if (this._changedItems.some((c) => c.id === key)) {
      let vehicle = this._changedItems.find((u) => u.id === key);
      vehicle.unUse = data.unUse;
    } else {
      let vehicle = data;
      this._changedItems.push(vehicle);
    }
  }

  onSelectionChanged(e) {
    this.selectedIds = this.selectedIds.filter((x) => x !== undefined);
  }

  onSave(grid) {
    const jobs: Observable<void>[] = [];
    //this._changedItems.length &&
    //  jobs.push(this.settingsSvc.saveVehicleRegs(this._changedItems));
    if (this._changedItems.length > 0)
      this.settingsSvc.saveVehicleRegs(this._changedItems);

    jobs.length &&
      forkJoin(jobs).subscribe(() => {
        this._changedItems = [];
        grid.instance.refresh();
      });
  }

  onRevert(grid) {
    this.selectedIds = [];
    this._changedItems = [];
  }

  private init() {
  }
}
