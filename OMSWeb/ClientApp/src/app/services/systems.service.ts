import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ISystemStates } from '@oms/models/system.model';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

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
}
