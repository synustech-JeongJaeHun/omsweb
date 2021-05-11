import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SettingsDialogComponent } from '../../settings/dialogs/settings-dialog.component';

@Component({
  selector: 'oms-gnb-menus',
  templateUrl: './gnb-menus.component.html',
  styleUrls: ['./gnb-menus.component.scss'],
})
export class GnbMenusComponent implements OnInit, OnDestroy {
  parentRoute: string;

  private routing$: Subscription;
  private _dlg: MatDialogRef<SettingsDialogComponent>;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private location: Location
  ) {}
  ngOnDestroy(): void {
    this.routing$ && this.routing$.unsubscribe();
  }

  ngOnInit(): void {
    this.detectParentRoute();
    this.routing$ = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((val) => {
        this.detectParentRoute();
        this.navigationChanged();
        // this.parentRoute = routeNames.find(r => this.router.isActive(r, false));
      });
  }

  onOpenSettings() {
    this._dlg = this.dialog.open(SettingsDialogComponent, {
      width: '800px',
      hasBackdrop: false,
      disableClose: true,
      closeOnNavigation: true,
    });
  }

  private navigationChanged() {
    this._dlg && this._dlg.close();
  }

  private detectParentRoute() {
    const routeNames = [
      '/monitor',
      '/playback',
      '/histories',
      '/logs',
      '/settings',
    ];
    this.parentRoute = routeNames.find((r) => this.router.isActive(r, false));
  }
}
