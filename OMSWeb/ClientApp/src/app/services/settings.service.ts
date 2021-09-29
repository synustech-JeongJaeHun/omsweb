import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ClientPreferences, ISettingsBufferWithUnuse, ISettingsSegment, ISettingsSegmentWithVParts, ISettingsSegmentWithVPartsNBlocking, ISettingsStationWithUnuse, ISettingsVehicleReg, ISettingsZcu, ServiceConfig } from '../models/settings.model';
import { StorageUtil } from '../modules/shared/utils/storage.util';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import CustomStore from 'devextreme/data/custom_store';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private baseUrl = '/api/settings';

  private _globalPreferences: ClientPreferences;
  private _serviceConfig: ServiceConfig;

  get globalPreferences(): ClientPreferences {
    return this._globalPreferences;
  }

  get serviceConfig(): Observable<ServiceConfig> {
    if (this._serviceConfig) return of(this._serviceConfig);
    return this.loadConfig();
  }

  constructor(private http: HttpClient) {
    this.loadPreferences();
  }

  private loadConfig(): Observable<ServiceConfig> {
    return this.http.get<ServiceConfig>(`/api/systems/settings/client`).pipe(
      tap((x) => {
        this._serviceConfig = x;
      })
    );
    // return this.http.get<ServiceConfig>(`/api/systems/config`);
  }

  loadPreferences() {
    this._globalPreferences = new ClientPreferences('global.pref');
  }

  settingsSegments(): Observable<ISettingsSegmentWithVPartsNBlocking[]> {
    return this.http.get<ISettingsSegmentWithVPartsNBlocking[]>(`${this.baseUrl}/segments`);
  }

  settingsStations(): Observable<ISettingsStationWithUnuse[]> {
    return this.http.get<ISettingsStationWithUnuse[]>(`${this.baseUrl}/stations`);
  }

  settingsBuffers(): Observable<ISettingsBufferWithUnuse[]> {
    return this.http.get<ISettingsBufferWithUnuse[]>(`${this.baseUrl}/buffers`);
  }

  settingsPointsDataSource(): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/points`
      }),
    });
  }

  settingsZcus(): Observable<ISettingsZcu[]> {
    return this.http.get<ISettingsZcu[]>(`${this.baseUrl}/zcus`);
  }

  settingsZcuInputZonesDataSource(id): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/zcu-input-zones`
      }),
      filter: [
        ['zcuId', '=', id],
      ],
    });
  }

  settingsVehicles(): Observable<ISettingsVehicleReg[]> {
    return this.http.get<ISettingsVehicleReg[]>(`${this.baseUrl}/vehicleRegs`);
  }

  saveVehicleRegs(form: any[]): Observable<void> {
    //alert(form.length);
    return;
  }
}
