import { Component, Input, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';

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

  dataSource: any;
  selectedRows: IVehicleStatusRow[] = [];

  constructor(private statusSvc: StatusService) {
    this.dataSource = this.getStatesStore();
  }

  ngOnInit(): void {
  }

  private getStatesStore() : CustomStore {
    const storeUrl = '/api/status';
    return AspNetData.createStore({
      key: 'id',
      loadUrl: `${storeUrl}/vehicles`,
    });
  }
}
