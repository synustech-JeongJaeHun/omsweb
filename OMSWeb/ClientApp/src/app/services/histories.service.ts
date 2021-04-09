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

  orders(): Observable<IPaginatedResult<IOrderHistoryRow>> {
    console.error('# form history-order.json file - for test #');
    return this.http.get<any>('/assets/json/history-order.json').pipe(
      // @TODO api 작업후에는 삭제
      map((res) => {
        return {
          total: parseInt(res.recordsTotal),
          filtered: parseInt(res.recordsFiltered),
          items: res.data,
        };
      })
    );
  }

  vehicles(): Observable<IPaginatedResult<IVehicleHistoryRow>> {
    console.error('# form history-order.json file - for test #');
    return this.http.get<any>('/assets/json/history-vehicle.json').pipe(
      // @TODO api 작업후에는 삭제
      map((res) => {
        return {
          total: parseInt(res.recordsTotal),
          filtered: parseInt(res.recordsFiltered),
          items: res.data,
        };
      })
    );
  }
  alarms(): Observable<IPaginatedResult<IAlarmHistoryRow>> {
    console.error('# form history-alarm.json file - for test #');
    return this.http.get<any>('/assets/json/history-alarm.json').pipe(
      // @TODO api 작업후에는 삭제
      map((res) => {
        return {
          total: parseInt(res.recordsTotal),
          filtered: parseInt(res.recordsFiltered),
          items: res.data,
        };
      })
    );
  }
}
