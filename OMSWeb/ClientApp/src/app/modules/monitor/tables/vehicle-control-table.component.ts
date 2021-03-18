import { Component, Input, OnInit } from '@angular/core';
import { IPaginatedResult } from '../../../models/base.model';
import { IVehicleStatusRow } from '../../../models/vehicle-status.model';
import { StatusService } from '../../../services/status.service';

@Component({
  selector: 'oms-vehicle-control-table',
  templateUrl: './vehicle-control-table.component.html',
  styleUrls: ['./vehicle-control-table.component.scss'],
})
export class VehicleControlTableComponent implements OnInit {
  @Input() tableHeight: number;

  dataSetResult: IPaginatedResult<IVehicleStatusRow>;
  loaded = false;
  selectedRows: IVehicleStatusRow[] = [];

  constructor(private statusSvc: StatusService) {}

  ngOnInit(): void {
    this.statusSvc.vehicleStatus().subscribe((res) => {
      this.dataSetResult = res;
      this.loaded = true;
    });
  }
}
