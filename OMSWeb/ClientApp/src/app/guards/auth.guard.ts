import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { flatMap, map, switchMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';

import { AuthService } from '../services/auth.service';
import { SettingsService } from '../services/settings.service';
import { LoginDialogComponent } from '../modules/shared/dialogs/login-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private settings: SettingsService,
    private dialog: MatDialog
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.auth.isAuthenticated) return true;
    return this.openLogin();
  }

  private openLogin(): Observable<boolean> {
    return this.dialog
      .open(LoginDialogComponent, {
        width: '350px',
        hasBackdrop: true,
        disableClose: true,
      })
      .afterClosed()
      .pipe(map((res) => !!res));
  }
}
