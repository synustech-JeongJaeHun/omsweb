import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { IModuleStatus, IServiceProcessStates, ISystemStates, IFileItem } from '@oms/models/system.model';
import { Form } from '@angular/forms';
@Injectable({
  providedIn: 'root',
})
export class SystemsService {
  private baseUrl = '/api/systems';
  private _states: ISystemStates;

  get currentState$(): Observable<ISystemStates> {
    return this.states();
  }

  constructor(private http: HttpClient) { }

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

  downloadFile(name: string, path: string): Observable<Blob> {
    let params = new HttpParams();
    params = params.append('fileFullPath', path);
    return this.http.get(`${this.baseUrl}/logs/downloadFile/${name}`, { params: params, responseType: 'blob' });
  }

  downloadFoldersNFiles(name: string, paths: any): Observable<Blob> {
    let params = new HttpParams();
    params = params.append('folderFullPaths', paths);
    return this.http.get(`${this.baseUrl}/logs/downloadFoldersNFiles/${name}`, { params: params, responseType: 'blob' });
  }

  downloadFolder(name: string, path: string): Observable<Blob> {
    let params = new HttpParams();
    params = params.append('folderFullPath', path);
    return this.http.get(`${this.baseUrl}/logs/downloadFolder/${name}`, { params: params, responseType: 'blob' });
  }
}
