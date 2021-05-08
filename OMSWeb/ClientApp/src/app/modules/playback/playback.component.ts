import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogState,
} from '@angular/material/dialog';
import { PlaybackControlDialogComponent } from './dialogs/playback-control-dialog.component';

import { PlaybackService } from '@oms/services/playback.service';
import { IPreferences } from '../../models/settings.model';
import { SettingsService } from '../../services/settings.service';
import { ViewModes } from '../../models/enums';
import { IPlaybackData } from '../../models/playback.model';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'oms-playback',
  templateUrl: './playback.component.html',
  styleUrls: ['playback.component.scss'],
})
export class PlaybackComponent implements OnInit, OnDestroy {
  loadingState = true;
  ready = false;
  mapPreference: IPreferences;
  viewMode: ViewModes;
  playbackData: IPlaybackData;

  get showControlTable(): boolean {
    return this.mapPreference.toggles.controlTable;
  }

  private _controlDlg: MatDialogRef<PlaybackControlDialogComponent>;
  private destroy$ = new Subject<void>();

  constructor(
    private dialog: MatDialog,
    private playbackSvc: PlaybackService,
    private settingSvc: SettingsService
  ) {
    this.viewMode = ViewModes.playback;

    this.playbackSvc.playbackData$
      .pipe(take(1))
      .subscribe((data) => {
        console.log('@@@ playback data res 1 @@@');
        this.playbackData = data;
        this.loadingState = false;
        this.ready = true;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._controlDlg &&
      this._controlDlg.getState() === MatDialogState.OPEN &&
      this._controlDlg.close();
  }

  ngOnInit(): void {
    this.mapPreference = this.settingSvc.globalPreferences;
    this.openController();
  }

  private openController() {
    this._controlDlg = this.dialog.open(PlaybackControlDialogComponent, {
      width: '560px',
      hasBackdrop: false,
      disableClose: true,
      closeOnNavigation: true,
    });
  }
}
