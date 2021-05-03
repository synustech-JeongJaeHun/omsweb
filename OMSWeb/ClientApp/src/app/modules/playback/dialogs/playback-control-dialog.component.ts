import { Component, OnInit } from '@angular/core';

import {
  IPlaybackOptions,
  IPlaybackState,
  ITimeline,
  playbackSpeedValues,
} from '@oms/models/playback.model';
import { mergeMap, tap } from 'rxjs/operators';
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

  private oneDay = 1000 * 60 * 60 * 24;
  private timeLine: ITimeline = {};

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
          console.log('## snapshot time >>', time);
          this.firstTime = time;
        }),
        mergeMap((time) => {
          this.timeLine.start = new Date(time);
          const startTime = this.timeLine.start.getTime();
          this.timeLine.end =
            now.getTime() - startTime < this.oneDay
              ? now
              : new Date(startTime + this.oneDay);
          return this.playbackSvc.loadSnapshotOfDay(
            this.timeLine.start,
            this.timeLine.end
          );
        })
      )
      .subscribe((data) => {
        console.log('## playback data >>', data);
      });
  }
}
