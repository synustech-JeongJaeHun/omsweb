import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import DataSource from 'devextreme/data/data_source';

import { Dto } from '@oms/models/dto/track.model';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private baseUrl = '/api/status';
  constructor(private http: HttpClient) {}

  getTrack(): Observable<Dto.ITrackData> {
    return this.http.get<Dto.ITrackData>(`${this.baseUrl}/tracks`);
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
  stationStatusDataSource(): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/stations`,
      }),
    });
  }
  bufferStatusDataSource(): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/buffers`,
      }),
    });
  }
  zcuStatusDataSource(): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/zcus`,
      }),
    });
  }
  clusterStatusDataSource(): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/clusters`,
      }),
    });
  }
}
