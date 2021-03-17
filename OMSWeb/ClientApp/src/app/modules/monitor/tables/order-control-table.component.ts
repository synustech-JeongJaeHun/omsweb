import { Component, Input, OnInit } from '@angular/core';
import { IPaginatedResult } from '../../../models/base.model';
import { IOrderStatusRow } from '../../../models/order-status.model';
import { StatusService } from '../../../services/status.service';

@Component({
  selector: 'oms-order-control-table',
  templateUrl: './order-control-table.component.html',
  styleUrls: ['./order-control-table.component.scss'],
})
export class OrderControlTableComponent implements OnInit {
  @Input() tableHeight: number;

  dataSetResult: IPaginatedResult<IOrderStatusRow>;
  loaded = false;

  constructor(private statusSvc: StatusService) {}

  ngOnInit(): void {
    console.warn('order control init');
    this.statusSvc.orderStatus().subscribe((res) => {
      console.info('### get order status >>', res);
      this.dataSetResult = res;
      this.loaded = true;
    });
  }
}
