import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import DataSource from 'devextreme/data/data_source';

import { Dto } from '@oms/models/dto/track.model';
import { IPaginatedResult } from '../models/base.model';
import { IOrderStatusRow } from '../models/order-status.model';
import { IVehicleStatusRow } from '../models/vehicle-status.model';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private baseUrl = '/api/status';
  constructor(private http: HttpClient) {}

  getTrack(): Observable<Dto.ITrackData> {
    return this.http.get<Dto.ITrackData>(`${this.baseUrl}/tracks`);
    // @TODO assets/json/status-track.json 파일 삭제
    // console.error('# form status-track.json file - for test #');
    // return this.http.get('/assets/json/status-track.json');
  }

  getVehicles(): Observable<Dto.IVehicleTrackData> {
    return this.http.get(`${this.baseUrl}/tracks/vehicles`);
  }

  orderStatusDataSource(): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/orders`,
      }),
    });
  }
  vehicleStatusDataSource(): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/vehicles`,
      }),
    });
  }

  // orderStatus(): Observable<IPaginatedResult<IOrderStatusRow>> {
  //   console.error('# form order-status.json file - for test #');
  //   return this.http.get<any>('/assets/json/order-status.json').pipe(
  //     // @TODO api 작업후에는 삭제
  //     map((res) => {
  //       return {
  //         total: parseInt(res.recordsTotal),
  //         filtered: parseInt(res.recordsFiltered),
  //         items: res.data,
  //       };
  //     })
  //   );
  // }

  // vehicleStatus(): Observable<IPaginatedResult<IVehicleStatusRow>> {
  //   console.error('# form vehicle-status.json file - for test #');
  //   return this.http.get<any>('/assets/json/vehicle-status.json').pipe(
  //     // @TODO api 작업후에는 삭제
  //     map((res) => {
  //       return {
  //         total: parseInt(res.recordsTotal),
  //         filtered: parseInt(res.recordsFiltered),
  //         items: res.data,
  //       };
  //     })
  //   );
  // }
}
