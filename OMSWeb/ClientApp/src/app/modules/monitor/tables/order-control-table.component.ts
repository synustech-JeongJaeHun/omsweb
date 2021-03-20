import { Component, Input, NgZone, OnInit } from '@angular/core';
import { IPaginatedResult } from '../../../models/base.model';
import { IOrderStatusRow } from '../../../models/order-status.model';
import { StatusService } from '../../../services/status.service';
import { TrackIdService } from '../../../services/track-id.service';

@Component({
  selector: 'oms-order-control-table',
  templateUrl: './order-control-table.component.html',
  styleUrls: ['./order-control-table.component.scss'],
})
export class OrderControlTableComponent implements OnInit {
  @Input() tableHeight: number;

  dataSetResult: IPaginatedResult<IOrderStatusRow>;
  loaded = false;
  selectedRows;

  transformVehicleId = ({ value = '' }): string => {
    const text = this.idSvc.get_alternative_id('vehicle', 'logical_id', value) || value;
    return text.toString();
  };

  transformLocationId = ({value = ''}): string => {
    return this.idSvc.guessLocationId(value);
  }

  constructor(
    private statusSvc: StatusService,
    private idSvc: TrackIdService
  ) {}

  ngOnInit(): void {
    this.statusSvc.orderStatus().subscribe((res) => {
      this.dataSetResult = res;
      this.loaded = true;
    });
  }
}
