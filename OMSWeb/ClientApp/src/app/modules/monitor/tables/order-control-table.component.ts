import { Component, Input, NgZone, OnInit } from '@angular/core';
import { IPaginatedResult } from '../../../models/base.model';
import { IOrderStatusRow } from '../../../models/order-status.model';
import { StatusService } from '../../../services/status.service';
import { TrackIdService } from '../../../services/track-id.service';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import CustomStore from 'devextreme/data/custom_store';

@Component({
  selector: 'oms-order-control-table',
  templateUrl: './order-control-table.component.html',
  styleUrls: ['./order-control-table.component.scss'],
})
export class OrderControlTableComponent implements OnInit {
  @Input() tableHeight: number;

  dataSource: any;
  selectedRows: number[] = [];

  transformVehicleId = ({ value = '' }): string => {
    const text =
      this.idSvc.get_alternative_id('vehicle', 'logicalId', value) || value;
    return text.toString();
  };

  transformLocationId = ({ value = '' }): string => {
    return this.idSvc.guessLocationId(value);
  };

  constructor(private statusSvc: StatusService, private idSvc: TrackIdService) {
    this.dataSource = this.getStatesStore();
  }

  ngOnInit(): void {
  }

  private getStatesStore() : CustomStore {
    const storeUrl = '/api/status';
    return AspNetData.createStore({
      key: 'id',
      loadUrl: `${storeUrl}/orders`,
    });
  }
}
