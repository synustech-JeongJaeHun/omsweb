import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import CustomStore from 'devextreme/data/custom_store';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';

import { IPaginatedResult } from '../../../models/base.model';
import { IVehicleStatusRow } from '../../../models/vehicle-status.model';
import { StatusService } from '../../../services/status.service';
import DataSource from 'devextreme/data/data_source';
import { Subscription } from 'rxjs';
import { HubService } from '../../../services/hub.service';
import { IDataChangeEvent } from '../../../models/notification.model';

@Component({
  selector: 'oms-vehicle-control-table',
  templateUrl: './vehicle-control-table.component.html',
  styleUrls: ['./vehicle-control-table.component.scss'],
})
export class VehicleControlTableComponent implements OnInit, OnDestroy {
  @Input() tableHeight: number;

  dataSource: DataSource;
  selectedRows: IVehicleStatusRow[] = [];

  //#region Subscriptions
  private tableChanged$: Subscription;
  //#endregion

  constructor(private statusSvc: StatusService, private hubSvc: HubService) {
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
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${storeUrl}/vehicles`,
      }),
    });
  }
}
