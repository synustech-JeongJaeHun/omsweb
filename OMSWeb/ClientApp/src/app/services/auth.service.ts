import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import {
  ILoginForm,
  IProfileForm,
  ISessionUser,
  ISimpleUser,
  IUserToken,
} from '../models/user.model';
import { Observable, of, Subject, throwError } from 'rxjs';

import { ITokenResult } from '../models/base.model';
import { StorageUtil } from '../modules/shared/utils/storage.util';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = '/api/auth';
  private _token: string;
  private _currentUser: ISessionUser;
  private _expiresAt: number;
  private jwtHelper: JwtHelperService;

  get currentUser(): ISessionUser {
    !this._currentUser && this.readSession();
    return this._currentUser;
  }

  get token(): string {
    !this._token && this.readSession();
    return this._token;
  }

  get isAuthenticated(): boolean {
    return !!this.token && this._expiresAt > Date.now().valueOf();
  }

  certUpdated$: Subject<ISimpleUser> = new Subject();

  constructor(private http: HttpClient, private router: Router) {
    this.jwtHelper = new JwtHelperService();
  }

  authenticate(form: ILoginForm): Observable<ISessionUser> {
    return this.http.post<ITokenResult>(`${this.baseUrl}`, form).pipe(
      map((res) => {
        const { token } = res;
        this.writeSession(token);
        return this._currentUser;
      })
    );
  }

  logout(): Observable<void> {
    this.clearSession();
    this.router.navigate(['/']);
    return of();
  }

  updateProfile(form: IProfileForm): Observable<void> {
    return this.http.patch<void>(`/api/users/profile`, form).pipe(
      tap(() => {
        this._currentUser.firstName = form.firstName;
        this._currentUser.lastName = form.lastName;
        this._currentUser.email = form.email;

        this.certUpdated$.next(this._currentUser);
      })
    );
  }

  private parseToken(checkCurrentTime = false) {
    const { exp, iat, nbf, ...user } = this.jwtHelper.decodeToken(this._token);
    user.roles = user.roles
      ? user.roles.split(',').map((r) => parseInt(r))
      : [];
    this._expiresAt =
      checkCurrentTime && iat * 1000 - Date.now().valueOf() > 1000 * 60 * 10
        ? 1
        : exp * 1000;
    return user;
  }

  private readSession(checkExpired = false) {
    this._token = StorageUtil.getSession('jwt');
    if (this._token) {
      const userValue = StorageUtil.getSession('user');
      userValue && (this._currentUser = JSON.parse(userValue));
      (checkExpired || !this._expiresAt) && this.parseToken();
    }
  }

  private writeSession(token: string) {
    this._token = token;
    this._currentUser = this.parseToken(true);
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
