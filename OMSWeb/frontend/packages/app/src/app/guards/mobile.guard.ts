import { Injectable } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "@oms/services/auth.service";
import {SettingsService} from "@oms/services/settings.service";
import {MatDialog} from "@angular/material/dialog";
import {MobileService} from "@oms/services/mobile.service";

@Injectable({
  providedIn: 'root'
})
export class MobileGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router,
    private mobile: MobileService
  ) {
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.mobile.isMobile) {
      this.router.navigate(['/mobile']);
      return true
    }
    else {
      this.router.navigate(['/monitor']);
      return false
    }
  }

}
