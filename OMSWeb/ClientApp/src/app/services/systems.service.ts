import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { IModuleStatus, IServiceProcessStates, ISystemStates } from '@oms/models/system.model';
@Injectable({
  providedIn: 'root',
})
export class SystemsService {
  private baseUrl = '/api/systems';
  private _states: ISystemStates;

  get currentState$(): Observable<ISystemStates> {
    if (this._states) return of(this._states);
    return this.states();
  }

  constructor(private http: HttpClient) {}

  states(): Observable<ISystemStates> {
    return this.http.get<ISystemStates>(`${this.baseUrl}/states`).pipe(
      tap((res) => {
        this._states = res;
      })
    );
  }

  changeStates(nextStates: ISystemStates): Observable<ISystemStates> {
    return this.http.patch<ISystemStates>(`${this.baseUrl}/states`, nextStates);
  }

  vehicles(): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `/assets/json/vehicles.json`,
      }),
    });
  }

  processes(): Observable<IServiceProcessStates[]> {
    return this.http.get<IServiceProcessStates[]>('/assets/json/processes.json');
  }

  moduleStatus(): Observable<IModuleStatus[]> {
    return this.http.get<IModuleStatus[]>(`${this.baseUrl}/module-status`);
  }
}
