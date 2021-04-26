import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import DataSource from 'devextreme/data/data_source';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import { Observable } from 'rxjs';
import { IPermission, IRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private baseUrl = '/api/users';
  constructor(private http: HttpClient) {}

  usersDataSource(): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}`,
        updateUrl: `${this.baseUrl}/update`,
        deleteUrl: `${this.baseUrl}/remove`,
      }),
    })
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
}
