import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { IPaginatedResult } from '../../../models/base.model';
import { IOrderStatusRow } from '../../../models/order-status.model';
import { StatusService } from '../../../services/status.service';
import { TrackIdService } from '../../../services/track-id.service';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import CustomStore from 'devextreme/data/custom_store';
import { HubService } from '../../../services/hub.service';
import { Subscription } from 'rxjs';
import { IDataChangeEvent } from '../../../models/notification.model';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'oms-order-control-table',
  templateUrl: './order-control-table.component.html',
  styleUrls: ['./order-control-table.component.scss'],
})
export class OrderControlTableComponent implements OnInit, OnDestroy {
  @Input() tableHeight: number;

  dataSource: DataSource;
  // dataSource: any;
  selectedRows: number[] = [];

  //#region Subscriptions
  private tableChanged$: Subscription;
  //#endregion

  transformVehicleId = ({ value = '' }): string => {
    const text =
      this.idSvc.get_alternative_id('vehicle', 'logicalId', value) || value;
    return text.toString();
  };

  transformLocationId = ({ value = '' }): string => {
    return this.idSvc.guessLocationId(value);
  };

  constructor(
    private statusSvc: StatusService,
    private idSvc: TrackIdService,
    private hubSvc: HubService
  ) {
    this.dataSource = this.getStatesStore();
  }
  ngOnDestroy(): void {
    this.tableChanged$ && this.tableChanged$.unsubscribe();
  }

  ngOnInit(): void {
    this.tableChanged$ = this.hubSvc.orderTableChanged$.subscribe(
      (e: IDataChangeEvent) => {
        e && this.onTableChanged(e);
      }
    );
  }

  onDelete() {
  }

  private onTableChanged(payload: IDataChangeEvent) {
    let needReload = false;
    if (payload && payload.id && payload.operation) {
      if (['INSERT', 'DELETE'].includes(payload.operation)) {
        needReload = true;
      } else {
        needReload = this.dataSource.items().every(x => x.id !== payload.id);
      }
    } else {
      needReload = true;
    }
    needReload && this.dataSource.reload();
  }

  private getStatesStore(): DataSource {
    const storeUrl = '/api/status';
    // return AspNetData.createStore({
    //   key: 'id',
    //   loadUrl: `${storeUrl}/orders`,
    // })
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${storeUrl}/orders`,
      }),
    });
  }
}
