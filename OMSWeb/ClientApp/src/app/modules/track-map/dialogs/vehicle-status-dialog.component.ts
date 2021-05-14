import { Component, OnInit } from '@angular/core';
import { ILookupUnit } from '../../../models/map.interface';

@Component({
  selector: 'oms-vehicle-status-dialog',
  templateUrl: './vehicle-status-dialog.component.html',
  styleUrls: ['./vehicle-status-dialog.component.scss'],
})
export class VehicleStatusDialogComponent implements OnInit {
  selectedVehicle: ILookupUnit;

  constructor() {}

  ngOnInit(): void {}
}
