import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import {
  ILoginForm,
  IProfileForm,
  ISessionUser,
  ISimpleUser,
} from '../models/user.model';
import { Observable, of, Subject } from 'rxjs';

import { ITokenResult } from '../models/base.model';
import { StorageUtil } from '../modules/shared/utils/storage.util';
import { JwtHelperService } from '@auth0/angular-jwt';
import { map, tap } from 'rxjs/operators';
import { SettingsService } from './settings.service';
import { AccountUtil } from '../modules/shared/utils/account.util';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = '/api/auth';
  private _token: string;
  private _sid: string;
  private _currentUser: ISessionUser;
  private _expiresAt: number;
  private jwtHelper: JwtHelperService;
  private tokenRenewalTimeout: any;

  get currentUser(): ISessionUser {
    !this._currentUser && this.readSession();
    return this._currentUser;
  }

  get token(): string {
    !this._token && this.readSession();
    return this._token;
  }

  get sid(): string {
    !this._sid && this.readSID();
    return this._sid;
  }

  get isAuthenticated(): boolean {
    return !!this.token && this._expiresAt > Date.now().valueOf();
  }

  certUpdated$: Subject<ISimpleUser> = new Subject();

  constructor(
    private http: HttpClient,
    private router: Router,
    private settingSvc: SettingsService
  ) {
    this.jwtHelper = new JwtHelperService();
    this.scheduleRenewal();
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
    this.http.delete(`${this.baseUrl}/logout`).subscribe()
    this.clearSession();
    clearTimeout(this.tokenRenewalTimeout);
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

  hasPermissions(permissions: number[]): boolean {
    return AccountUtil.hasPermissions(permissions, this.currentUser);
  }

  getSID() {
    this.readSID();
    return this._sid;
  }

  updateSID(sid: string) {
    this.writeSID(sid);
  }

  private parseToken(checkCurrentTime = false): ISessionUser {
    const { exp, iat, nbf, ...user } = this.jwtHelper.decodeToken(this._token);
    const roles: number[] = user.roles
      ? user.roles.split(',').map((r: string) => Number(r).valueOf())
      : [];
    const permissions: number[] = user.permissions
      ? user.permissions.split(',').map((p: string) => Number(p).valueOf())
      : [];
    this._expiresAt =
      checkCurrentTime && iat * 1000 - Date.now().valueOf() > 1000 * 60 * 10
        ? 1
        : exp * 1000;
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions,
      roles,
      userId: user.userId,
      email: user.email,
    };
  }

  private readSID() {
    this._sid = StorageUtil.getLocal('sid');
  }

  private writeSID(sid: string) {
    StorageUtil.setLocal('sid', sid);
  }

  private readSession(checkExpired = false) {
    this._token = StorageUtil.getSession('jwt');
    if (this._token) {
      const userValue = StorageUtil.getSession('user');
      userValue && (this._currentUser = JSON.parse(userValue));
      (checkExpired || !this._expiresAt) && this.parseToken();
    }
  }

  private writeSession(token: string, notify = true) {
    this._token = token;
    this._currentUser = this.parseToken(true);
    StorageUtil.setSession('jwt', token);
    StorageUtil.setSession('user', JSON.stringify(this._currentUser));
    notify && this.certUpdated$.next(this._currentUser);
    this.scheduleRenewal();
  }

  private clearSession() {
    this._token = undefined;
    this._currentUser = undefined;
    this.certUpdated$.next(undefined);
    StorageUtil.clearSession();
  }

  public renewToken(): Observable<string> {
    const url = `${this.baseUrl}/renew`;
    return this.http.get<ITokenResult>(url).pipe(
      map(res => {
        this.writeSession(res.token, false);
        return res.token;
      })
    );
  }

  private scheduleRenewal() {
    this.readSession(true);
    const delay = this._expiresAt - Date.now().valueOf() - 10 * 1000;

    if (delay > 0) {
      this.tokenRenewalTimeout && clearTimeout(this.tokenRenewalTimeout);
      this.tokenRenewalTimeout = setTimeout(() => {
        this.renewToken().subscribe(
          () => { },
          err => {
            this.logout().subscribe();
            throw err;
          }
        );
      }, delay);
    }
  }
}
