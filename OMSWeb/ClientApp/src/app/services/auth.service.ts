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
  private _expiresAt: number;

  get currentUser(): ISessionUser {
    !this._currentUser && this.readSession();
    return this._currentUser;
  }

  get token(): string {
    !this._token && this.readSession();
    return this._token;
  }

  get isAuthenticated(): boolean {
    return !!this.token;
    // return !!this.token && this._expiresAt > Date.now().valueOf(); // @TODO check expired
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

    return of(this.currentUser);

    // return this.http.post<ITokenResult>(this.baseUrl, form);
  }

  logout(): Observable<void> {
    this.clearSession();
    this.router.navigate(['/']);
    return of();
  }

  private setExpiresAt(checkCurrentTime = false) {
    // @TODO 구현
    // const { exp, iat } = this.jwtHelper.decodeToken(this._token);
    // this._expiresAt =
    //   checkCurrentTime && iat * 1000 - Date.now().valueOf() > 1000 * 60 * 10
    //     ? 1 // client device 시간이 틀려서 반복적으로 renewToken이 호출되는 경우를 피하기 위함
    //     : exp * 1000;
  }

  private readSession(checkExpired = false) {
    this._token = StorageUtil.getSession('jwt');
    if (this._token) {
      const userValue = StorageUtil.getSession('user');
      userValue && (this._currentUser = JSON.parse(userValue));
      (checkExpired || !this._expiresAt) && this.setExpiresAt();
    }
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
