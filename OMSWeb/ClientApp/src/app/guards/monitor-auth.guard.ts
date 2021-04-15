import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
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
export class MonitorAuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private settings: SettingsService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.settings.serviceConfig.pipe(
      map((x) => {
        const { allowPublicMonitor } = x;
        if (allowPublicMonitor || this.auth.isAuthenticated) return of(true);
        else return this.openLogin();
      }),
      flatMap((x) => x)
    );
  }

  private openLogin(): Observable<boolean> {
    return this.dialog
      .open(LoginDialogComponent, {
        width: '350px',
        hasBackdrop: true,
        disableClose: true,
      })
      .afterClosed()
      .pipe(
        map((res) => {
          if (res) {
            this.router.navigate(['/monitor/status']);
            return true;
          } else return false;
        })
      );
  }
}
