import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ISettingsVehicleReg, IVehicleRegForm } from '../../../models/settings.model';

@Component({
  selector: 'oms-vehicle-form-dialog',
  templateUrl: './vehicle-form-dialog.component.html',
  styleUrls: ['./vehicle-form-dialog.component.scss'],
})
export class VehicleFormDialogComponent implements OnInit {
  addMode: boolean;
  public data: ISettingsVehicleReg[];

  constructor(
    @Inject(MAT_DIALOG_DATA) private vehicleReg: ISettingsVehicleReg,
    private dialog: MatDialogRef<VehicleFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private dataSource: ISettingsVehicleReg[]
  ) {
    this.addMode = !this.vehicleReg;
    this.data = dataSource;
  }

  ngOnInit(): void {

  }

  public setDataSource(data: any) {
    this.data = data;
  }
  public getDataSource() {
    return this.data;
  }

  onSubmit(form: IVehicleRegForm) {
    this.dialog.close(form);
  }

  onCancel() {
    this.dialog.close();
  }
}
