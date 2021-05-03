import { Component, OnInit } from '@angular/core';

import {
  IPlaybackOptions,
  IPlaybackState,
  playbackSpeedValues,
} from '@oms/models/playback.model';
import { tap } from 'rxjs/operators';
import { PlaybackService } from '../../../services/playback.service';

@Component({
  selector: 'oms-playback-control-dialog',
  templateUrl: './playback-control-dialog.component.html',
  styleUrls: ['./playback-control-dialog.component.scss'],
})
export class PlaybackControlDialogComponent implements OnInit {
  firstTime: Date;
  now: Date = new Date();
  options: IPlaybackOptions;
  states: IPlaybackState;

  speedValues = playbackSpeedValues;

  constructor(private playbackSvc: PlaybackService) {}

  ngOnInit(): void {
    const now: Date = new Date();
    this.options = {
      speed: 1,
      eventsStep: 5,
      snapshot: 0,
      event: 0,
    };

    this.states = {
      playing: false,
      event: 0,
      nextEvent: 0,
      playTime: '00:00:00',
    };
    this.playbackSvc
      .firstSnapshotTime()
      .pipe(
        tap((time) => {
          this.firstTime = time;
        })
      )
      .subscribe((time) => {
        console.log('## snapshot time >>', time);
      });
  }
}
