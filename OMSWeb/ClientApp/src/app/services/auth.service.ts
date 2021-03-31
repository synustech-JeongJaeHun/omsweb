import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { ILoginForm, ISessionUser, ISimpleUser } from '../models/user.model';
import { Observable, of, Subject, throwError } from 'rxjs';

import { ITokenResult } from '../models/base.model';
import { StorageUtil } from '../modules/shared/utils/storage.util';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = '/api/auth';
  private _token: string;
  private _currentUser: ISessionUser;

  get CurrentUser(): ISessionUser {
    return this._currentUser;
  }

  get Token(): string {
    return this._token;
  }

  get isAuthenticated(): boolean {
    return !!this.Token;
  }

  certUpdated$: Subject<ISimpleUser> = new Subject();

  constructor(private http: HttpClient, private router: Router) {}

  authenticate(form: ILoginForm): Observable<ISessionUser> {
    // @TODO auth api 연동
    /** <test code> */
    const { email, password } = form;
    if (email !== password) return throwError('invalid user');

    if (!['admin', 'user'].includes(email)) return throwError('invalid user');

    this.writeSession(email);

    return of(this.CurrentUser);

    // return this.http.post<ITokenResult>(this.baseUrl, form);
  }

  logout(): Observable<void> {
    this.clearSession();
    this.router.navigate(['/']);
    return of();
  }

  private writeSession(token: string) {
    // @TODO login process 구현
    /** <test_code>  */
    this._token = token;
    this._currentUser = {
      id: 1,
      email: token,
      name: token,
      permissions: token === 'admin' ? 4095 : 1,
      roles: [token],
    };
    StorageUtil.setSession('jwt', token);
    StorageUtil.setSession('user', JSON.stringify(this._currentUser));
    this.certUpdated$.next(this._currentUser);
  }

  private clearSession() {
    this._token = undefined;
    this._currentUser = undefined;
    this.certUpdated$.next(undefined);
    StorageUtil.clearSession();
  }
}
