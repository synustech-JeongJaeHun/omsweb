import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';
import { LoginDialogComponent } from '../shared/dialogs/login-dialog.component';
import {MobileService} from "@oms/services/mobile.service";

@Component({
  selector: 'oms-startup',
  templateUrl: './startup.component.html',
  styles: [],
})
export class StartupComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private settings: SettingsService,
    private dialog: MatDialog,
    private router: Router,

    private mobileSvc: MobileService
  ) { }

  ngOnInit(): void {
    this.settings.serviceConfig.subscribe((x) => {
      const { allowPublicMonitor } = x;

      if (allowPublicMonitor || this.auth.isAuthenticated) {
        const url = this.mobileSvc.isMobile ? '/mobile/public' : '/monitor/public'
        this.moveDefaultPage(url);
      } else this.openLogin();
    });
  }

  private openLogin() {
    return this.dialog
      .open(LoginDialogComponent, {
        width: '350px',
        hasBackdrop: true,
        disableClose: true,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const url = this.mobileSvc.isMobile ? '/mobile/status' : '/monitor/status'
          this.moveDefaultPage(url);
        }
      });
  }

  private moveDefaultPage(url: string) {
    this.router.navigate([url]);
  }
}
