import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import DataSource from 'devextreme/data/data_source';

import { Dto } from '@oms/models/dto/track.model';
import { IVehicleDIOStates, IVehicleSignal } from '../models/vehicle-status.model';

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

  getVehicleSignal(id: number): Observable<IVehicleSignal> {
    console.warn('# from vehicle-signal.json file - for dev #');
    return this.http.get<IVehicleSignal>('/assets/json/vehicle-signal.json');
  }

  vehicleDIOStates(id: number): Observable<IVehicleDIOStates> {
    console.warn('# from vehicle-io-status.json file - for dev #');
    return this.http.get<IVehicleDIOStates>('/assets/json/vehicle-io-status.json');
  }
}
