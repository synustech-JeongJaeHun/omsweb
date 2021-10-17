import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { IPaginatedResult } from '../models/base.model';
import {
  IAlarmHistoryRow,
  IOrderHistoryRow,
  IVehicleHistoryRow,
} from '../models/history.model';

@Injectable({
  providedIn: 'root',
})
export class HistoriesService {
  private baseUrl = '/api/histories';
  constructor(private http: HttpClient) {}

  ordersDataSource(startTime: Date, endTime: Date): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/orders`,
      }),
      filter: [
        ['timeCreated', '>=', startTime],
        'and',
        ['timeCreated', '<=', endTime],
      ],
    });
  }

  vehiclesDataSource(startTime: Date, endTime: Date): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/vehicles`,
      }),
      filter: [
        ['historyChangeTime', '>=', startTime],
        'and',
        ['historyChangeTime', '<=', endTime],
      ],
    });
  }

  alarmsDataSource(startTime: Date, endTime: Date): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/alarms`,
      }),
      filter: [
        ['time', '>=', startTime],
        'and',
        ['time', '<=', endTime],
      ],
    });
  }

  alertsDataSource(startTime: Date, endTime: Date): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        //loadUrl: `/assets/json/get-alerts.json`,
        loadUrl: `${this.baseUrl}/alerts`,
      }),
      filter: [
        ['time', '>=', startTime],
        'and',
        ['time', '<=', endTime],
      ],
    });
  }
}
