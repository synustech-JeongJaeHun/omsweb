import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Dto } from '@oms/models/dto/track.model';
import { IPaginatedResult } from '../models/base.model';
import { IOrderStatusRow } from '../models/order-status.model';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private baseUrl = '/api/status';
  constructor(private http: HttpClient) {}

  getTrack(): Observable<Dto.ITrackData> {
    return this.http.get<Dto.ITrackData>(`${this.baseUrl}/track`);
    // @TODO assets/json/status-track.json 파일 삭제
    // console.error('# form status-track.json file - for test #');
    // return this.http.get('/assets/json/status-track.json');
  }

  orderStatus(): Observable<IPaginatedResult<IOrderStatusRow>> {
    console.error('# form order-status.json file - for test #');
    return this.http.get<any>('/assets/json/order-status.json').pipe(
      map((res) => {
        return {
          total: parseInt(res.recordsTotal),
          filtered: parseInt(res.recordsFiltered),
          items: res.data,
        };
      })
    );
  }

  vehicleStatus(): Observable<any> {
    console.error('# form vehicle-status.json file - for test #');
    return this.http.get('/assets/json/vehicle-status.json');
  }
}
