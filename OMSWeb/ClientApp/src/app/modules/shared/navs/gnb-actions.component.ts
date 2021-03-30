import { Component, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogState,
} from '@angular/material/dialog';
import { LegendDialogComponent } from '../dialogs/legend-dialog.component';

@Component({
  selector: 'oms-gnb-actions',
  templateUrl: './gnb-actions.component.html',
  styleUrls: ['./gnb-actions.component.scss'],
})
export class GnbActionsComponent implements OnInit {
  private _legendDlg: MatDialogRef<LegendDialogComponent, any>;

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  onLegend() {
    if (this._legendDlg && this._legendDlg.getState() === MatDialogState.OPEN) {
      this._legendDlg.close();
      return;
    }

    this._legendDlg = this.dialog.open(LegendDialogComponent, {
      width: '650px',
      hasBackdrop: false,
      disableClose: true,
      closeOnNavigation: true,
    });
  }
}
