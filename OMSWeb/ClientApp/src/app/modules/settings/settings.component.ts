import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogState,
} from '@angular/material/dialog';

import { SettingsDialogComponent } from './dialogs/settings-dialog.component';

@Component({
  selector: 'oms-settings',
  template: ``,
  styles: [],
})
export class SettingsComponent implements OnInit, OnDestroy {
  private _dlg: MatDialogRef<SettingsDialogComponent>;

  constructor(private dialog: MatDialog, private location: Location) {}

  ngOnDestroy(): void {
    this._dlg &&
      this._dlg.getState() === MatDialogState.OPEN &&
      this._dlg.close(true);
  }

  ngOnInit(): void {
    this._dlg = this.dialog.open(SettingsDialogComponent, {
      width: '800px',
      hasBackdrop: false,
      disableClose: true,
      closeOnNavigation: true,
    });

    this._dlg.afterClosed().subscribe((disposed) => {
      !disposed && this.location.back();
    });
  }
}
