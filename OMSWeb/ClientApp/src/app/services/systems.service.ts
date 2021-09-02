import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { IModuleStatus, IServiceProcessStates, ISystemStates, IFileItem } from '@oms/models/system.model';
@Injectable({
  providedIn: 'root',
})
export class SystemsService {
  private baseUrl = '/api/systems';
  private _states: ISystemStates;

  get currentState$(): Observable<ISystemStates> {
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

  fileItems(): Observable<IFileItem[]> {
    return this.http.get<IFileItem[]>(`${this.baseUrl}/logs`);
  }

  downloadFileItems(items): Observable<IFileItem[]> {
    alert('download folders & files');
    //return this.http.get<IFileItem[]>(`${this.baseUrl}/logs/downloadFileItems`);
    return;
  }

  downloadFolderItems(name, key): Observable<IFileItem[]> {
    alert('download foler');
    //return this.http.get<IFileItem[]>(`${this.baseUrl}/logs/downloadFolder`);
    return;
  }  
}
