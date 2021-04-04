import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogState,
} from '@angular/material/dialog';
import { PlaybackControlDialogComponent } from './dialogs/playback-control-dialog.component';

@Component({
  selector: 'oms-playback',
  template: ``,
  styleUrls: ['playback.component.scss'],
})
export class PlaybackComponent implements OnInit, OnDestroy {
  private _controlDlg: MatDialogRef<PlaybackControlDialogComponent>;

  constructor(private dialog: MatDialog) {}

  ngOnDestroy(): void {
    this._controlDlg &&
      this._controlDlg.getState() === MatDialogState.OPEN &&
      this._controlDlg.close();
  }

  ngOnInit(): void {
    this._controlDlg = this.dialog.open(PlaybackControlDialogComponent, {
      width: '560px',
      hasBackdrop: false,
      disableClose: true,
      closeOnNavigation: true,
    });
  }
}
