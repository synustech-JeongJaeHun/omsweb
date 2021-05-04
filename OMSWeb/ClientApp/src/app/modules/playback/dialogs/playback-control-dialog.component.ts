import { Component, OnInit } from '@angular/core';

import {
  IPlaybackData,
  IPlaybackOptions,
  IPlaybackState,
  ITimelineQueryOptions,
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
  ready = false;

  speedValues = playbackSpeedValues;

  private oneDay = 1000 * 60 * 60 * 24;
  private timeLine: ITimelineQueryOptions = {};
  private data: IPlaybackData;

  get currentSnapshot(): Date {
    return this.getCurrentSnapshot(this.states.snapshot);
  }
  get currentEvent(): string {
    return this.getCurrentEvent(this.states.event);
  }

  constructor(private playbackSvc: PlaybackService) {}

  ngOnInit(): void {
    const now: Date = new Date();
    this.options = {
      speed: 1,
      nextEvent: 1,
    };

    this.states = {
      playing: false,
      snapshot: 0,
      event: 0,
      nextEvent: 0,
      playTime: '00:00:00',
    };
    this.playbackSvc
      .firstSnapshotTime()
      .pipe(
        tap((time) => {
          console.log('## snapshot time >>', time);
          this.options.startAt = time;
          this.options.endAt = now;
          this.options.maxTime = new Date(now.getTime() + 60000);
          this.firstTime = time;
          this.initDatePicker();
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
        this.data = data;
        this.initSnapshotSlider(data);
        this.initEventSlider(data);
        this.ready = true;
      });
  }

  getCurrentSnapshot(index: number): Date {
    return this.data?.dynamicSnapshotList[index];
  }
  getCurrentEvent(index: number): string {
    const id = this.data?.timeline[index]?.id;
    return id ? `#${id}` : '';
  }

  private initDatePicker() {
    this.options.startAt = this.firstTime;
  }

  private initSnapshotSlider(data: IPlaybackData) {
    const { dynamicSnapshotList } = data;
    this.options.snapshotMax = dynamicSnapshotList.length - 1;
  }
  private initEventSlider(data: IPlaybackData) {
    const { timeline } = data;
    this.options.eventMax = timeline.length - 1;
  }
}
