import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ISystemStates } from '@oms/models/system.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SystemsService {
  private baseUrl = '/api/systems';

  constructor(private http: HttpClient) {}

  states(): Observable<ISystemStates> {
    return this.http.get<ISystemStates>(`${this.baseUrl}/states`);
  }

  changeStates(nextStates: ISystemStates): Observable<ISystemStates> {
    return this.http.patch<ISystemStates>(`${this.baseUrl}/states`, nextStates);
  }
}
