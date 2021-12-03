import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { SettingsService } from '../../services/settings.service';
import { LoginDialogComponent } from '../shared/dialogs/login-dialog.component';

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
    private router: Router
  ) { }

  ngOnInit(): void {
    this.settings.serviceConfig.subscribe((x) => {
      const { sid, allowPublicMonitor } = x;

      if (sid != this.auth.sid) {
        this.auth.updateSID(sid);
        this.auth.logout();
      }

      if (allowPublicMonitor || this.auth.isAuthenticated) {
        this.moveDefaultPage('/monitor/public');
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
          this.moveDefaultPage('/monitor/status');
        }
      });
  }

  private moveDefaultPage(url: string) {
    this.router.navigate([url]);
  }
}
