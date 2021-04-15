import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ClientPreferences, ServiceConfig } from '../models/settings.model';
import { StorageUtil } from '../modules/shared/utils/storage.util';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
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
    // @TODO get service config api 연동
    console.warn('# TODO - get service config api 연동');
    return this.http
      .get<ServiceConfig>(`/assets/json/service-config.json`)
      .pipe(
        tap((x) => {
          this._serviceConfig = x;
        })
      );
    // return this.http.get<ServiceConfig>(`/api/systems/config`);
  }

  loadPreferences() {
    this._globalPreferences = new ClientPreferences('global.pref');
  }
}
