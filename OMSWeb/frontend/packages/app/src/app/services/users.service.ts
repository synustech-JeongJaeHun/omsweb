import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { Observable } from 'rxjs';
import {
  IPermission,
  IRole,
  ISimpleUser,
  IUserForm,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private baseUrl = '/api/users';
  constructor(private http: HttpClient) { }

  tokenHistoryDataSource(source: any, startTime: Date, endTime: Date): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/token-history/data-source`,
      }),
	    filter: [['timeCreated', '>=', startTime], 'and', ['timeCreated', '<=', endTime]],
	    onChanged: () => {
		    source.onDataSourceChanged();
	    },
    });
  }

  usersDataSource(): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/data-source`,
      }),
    });
  }
  users(): Observable<ISimpleUser[]> {
    return this.http.get<ISimpleUser[]>(this.baseUrl);
  }

  roles(): Observable<IRole[]> {
    return this.http.get<IRole[]>(`${this.baseUrl}/roles`);
  }
  permissionRoles(): Observable<IRole[]> {
    return this.http.get<IRole[]>(`${this.baseUrl}/permission-roles`);
  }
  permissions(): Observable<IPermission[]> {
    return this.http.get<IPermission[]>(`${this.baseUrl}/permissions`);
  }
  saveAccounts(form: IUserForm[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/batch/save`, form);
  }
  deleteAccounts(ids: string[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/batch/remove`, ids);
  }
  saveRoles(form: IRole[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/roles`, form);
  }
  deleteRoles(ids: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/roles/remove`, ids);
  }
}
