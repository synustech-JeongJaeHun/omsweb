import { Component, OnDestroy, OnInit } from '@angular/core';

import {
  IPlaybackData,
  IPlaybackOptions,
  IPlaybackState,
  ITimeline,
  ITimelineQueryOptions,
  playbackSpeedValues,
} from '@oms/models/playback.model';
import { Observable, Subject, throwError, timer } from 'rxjs';
import { finalize, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { PlaybackService } from '../../../services/playback.service';
import { MapDataService } from '../../track-map/map-data.service';

@Component({
  selector: 'oms-playback-control-dialog',
  templateUrl: './playback-control-dialog.component.html',
  styleUrls: ['./playback-control-dialog.component.scss'],
})
export class PlaybackControlDialogComponent implements OnInit, OnDestroy {
  firstTime: Date;
  options: IPlaybackOptions;
  states: IPlaybackState;
  ready = false;

  speedValues = playbackSpeedValues;
  // eventList: ITimeline[] = [];

  private oneDay = 1000 * 60 * 60 * 24;
  private timeLine: ITimelineQueryOptions = {};
  private data: IPlaybackData;
  private destroy$ = new Subject<void>();
  private timer$: Observable<number>;
  private timerStop$ = new Subject<void>();

  get currentSnapshot(): Date {
    return this.getCurrentSnapshot(this.states.snapshot);
  }
  get currentEvent(): string {
    return this.getCurrentEvent(this.states.event);
  }
  get eventList(): ITimeline[] {
    return this.data?.timeline || [];
  }
  get isLastEvent(): boolean {
    return this.states.event === this.data.timeline?.length - 1;
  }
  get isFirstEvent(): boolean {
    return this.states.event === 0;
  }
  get isLastSnapshot(): boolean {
    return this.states.snapshot === this.data.dynamicSnapshotList?.length - 1;
  }
  get isFirstSnapshot(): boolean {
    return this.states.snapshot === 0;
  }
  get showEventHandle(): boolean {
    return this.firstTime && this.eventList.length > 0;
  }
  get enableFastForward(): boolean {
    return this.options.nextEvent >= 0;
  }

  constructor(
    private playbackSvc: PlaybackService,
    private dataSvc: MapDataService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.options = {
      speed: 1,
    };

    this.states = {
      playing: false,
      snapshot: 0,
      event: 0,
      nextEvent: 0,
    };
    this.loadInitData();
  }

  getCurrentSnapshot(index: number): Date {
    return this.data?.dynamicSnapshotList[index];
  }
  getCurrentEvent(index: number): string {
    const id = this.data?.timeline[index]?.eventId;
    return id ? `#${id}` : '';
  }

  onTogglePlay() {
    !this.states.playing ? this.play() : this.stop();
  }
  onTimeRangeChanged(event: any) {
    if (event.event) {
      this.ready = false;
      this.timerStop$.next();
      this.queryPlaybackData()
        .pipe(
          finalize(() => {
            this.options = { ...this.options, nextEvent: undefined };
            this.states = {
              ...this.states,
              playing: false,
              snapshot: 0,
              event: 0,
              nextEvent: 0,
            };
            this.ready = true;
          })
        )
        .subscribe();
    }
  }

  onSlideSnapshot(index: number) {
    if (index !== this.states.lastSnapshot) {
      this.stop();
      this.states.lastSnapshot = index;
      this.ready = false;
      this.loadSnapshot(this.states.snapshot).subscribe((res) => {
        this.ready = true;
      });
    }
  }
  onSlideEvent(index: number) {
    const diff = index - this.states.event;
    this.states.event = index;
    const reversed = diff < 0;
    const step = Math.abs(diff);
    if (step === 1) {
      this.updateTrack(index, reversed, false);
    } else {
      this.skip(diff, reversed);
    }
  }
  onBefore() {
    if (this.isFirstEvent) {
      if (!this.isFirstSnapshot) {
        this.loadSnapshot(--this.states.snapshot).subscribe();
      }
    } else {
      this.stop();
      this.skip(this.states.event, true);
    }
  }
  onNext() {
    if (!this.isLastSnapshot) {
      this.stop();
      this.loadSnapshot(++this.states.snapshot).subscribe();
    } else {
      throw Error('This is the last snapshot.');
    }
  }
  onFastForward() {}

  onChangeEventTo() {
    this.moveEventTo(this.options.nextEvent);
  }

  private moveEventTo(eventIndex: number) {
    const diff = eventIndex - this.states.event;
    if (diff == 0) return;
    this.stop();
    this.skip(Math.abs(diff), diff < 0);
  }

  private skip(step: number, reversed: boolean) {
    this.ready = false;
    setTimeout(() => {
      const startIndex = reversed ? 0 : 1;
      const vector = reversed ? -1 : 1;
      let currentIndex = 0;
      this.dataSvc.updatedVehicleList = {};
      for (let i = startIndex; i < step; i++) {
        currentIndex = this.states.event + i * vector;
        if (currentIndex > this.eventList.length - 1 || currentIndex < 0) break;
        this.updateTrack(currentIndex, reversed, true, true);
      }
      this.dataSvc.afterPlaybackTrackUpdated$.next();

      this.states.event += step * vector;
      this.ready = true;
    }, 10);
  }

  private stop() {
    this.timerStop$.next();
    this.states.playing = false;
  }
  private play() {
    // console.log('@@ play @@ >>', this.states.event, this.states.playing);
    this.states.playing = true;
    if (this.data.timeline[this.states.event]) {
      this.updateTrack(this.states.event, false, false);
      // this.states.playTime = this.data.timeline[this.states.event].eventTime;

      if (this.states.playing && !this.isLastEvent) {
        const nextTime = this.getNextEventInterval();
        this.states.nextEvent = nextTime / 1000;
        this.states.event++;
        if (nextTime > 100) {
          // @TODO LAB : 실질적인 지연효과가 의미없는 시간은 bypass
          const timerInterval = nextTime / this.options.speed;
          this.timer$ = timer(timerInterval).pipe(
            takeUntil(this.destroy$),
            takeUntil(this.timerStop$)
          );
          this.timer$.subscribe((t) => {
            this.play();
          });
        } else {
          this.play();
        }
      } else if (
        this.states.playing &&
        this.isLastEvent &&
        !this.isLastSnapshot
      ) {
        // const fallbackSnapshot = this.states.snapshot++;
        this.loadSnapshot(++this.states.snapshot).subscribe((_) => {
          this.states.event = 0;
          this.play();
        });
      } else {
        this.stop();
        throw Error('Playing is completed.');
      }
    } else {
      this.stop();
      throw Error('Playing is completed.');
    }
  }
  private loadInitData() {
    const now: Date = new Date();
    this.playbackSvc
      .firstSnapshotTime()
      .pipe(
        mergeMap((time) => {
          this.firstTime = time;
          this.initDatePicker();

          this.options.startAt = new Date(time);
          const startTime = this.options.startAt.getTime();
          this.options.endAt =
            now.getTime() - startTime < this.oneDay
              ? now
              : new Date(startTime + this.oneDay);
          this.options.maxTime = new Date(now.getTime() + 60000);
          return this.queryPlaybackData();
        })
      )
      .subscribe((data) => {
        this.ready = true;
      });
  }
  private queryPlaybackData() {
    return this.playbackSvc
      .playbackDataSet(this.options.startAt, this.options.endAt)
      .pipe(
        tap((data) => {
          // console.log('## playback data >>', data);
          this.data = data;
          this.dataSvc.trackDataUpdated$.next(data);
          this.bindSnapshots(data);
          this.bindEventsData(data);
        })
      );
  }
  private loadSnapshot(snapshotIndex: number) {
    const dynamicSnapshot = this.data.dynamicSnapshotList[snapshotIndex];
    return this.playbackSvc
      .snapshot(this.data.trackSnapshot, dynamicSnapshot)
      .pipe(
        tap((data) => {
          if (!data) return;

          const eventVersion = new Date(dynamicSnapshot).getTime();
          // this.playbackSvc.eventVersion = eventVersion; // @NOTE playback_last_event_time
          this.timerStop$.next();
          this.options.nextEvent = undefined;
          this.states.event = 0;

          // if another_snapshot
          this.data.timeline = data.timeline;
          this.data.eventTables = data.eventTables;
          this.data.orders = data.orders;

          this.bindEventsData(data);

          // if update_display
          this.dataSvc.applySnapshot(data, eventVersion);
        })
      );
  }
  private getNextEventInterval(): number {
    const { eventList } = this;
    const { event } = this.states;
    if (eventList[event + 1]) {
      return (
        new Date(eventList[event + 1].eventTime).getTime() -
        new Date(eventList[event].eventTime).getTime()
      );
    }
    return 0;
  }

  private initDatePicker() {
    this.options.startAt = this.firstTime;
  }

  private bindSnapshots(data: IPlaybackData) {
    const { dynamicSnapshotList } = data;
    this.options.snapshotMax = dynamicSnapshotList.length - 1;
  }
  private bindEventsData(data: IPlaybackData) {
    const { timeline } = data;
    // this.eventList = timeline;
    this.options.eventMax = timeline.length - 1;
    if (this.eventList && this.eventList.length > 0) {
      this.states.playTime = this.eventList[0].eventTime;
    }
  }
  private updateTrack(
    eventIndex: number,
    reversed: boolean,
    skipRender: boolean,
    useVehicleChangedProps = false
  ) {
    const event = this.data.timeline[eventIndex];
    const table = event.tableName;
    const delta = { ...this.takeEvent(table, event.eventId) };
    let operation = delta.historyChangeType;
    const id = delta.historySourceId;
    delta.id = id;
    this.states.playTime = event.eventTime;

    if (reversed) {
      operation =
        operation === 'INSERT'
          ? 'DELETE'
          : operation === 'DELETE'
          ? 'INSERT'
          : 'UPDATE';
    }

    if (table === 'order_history')
      this.playbackSvc.updateOrderTable(operation, delta, id, skipRender);
    if (table === 'vehicle_history')
      this.playbackSvc.updateVehicleTable(operation, delta, id, skipRender);

    this.dataSvc.playbackTrackUpdated$.next({
      table,
      data: delta,
      id: id,
      skipRender,
      operation,
      useVehicleChangedProps,
    });
  }
  private takeEvent(tableName: string, id?: number) {
    const table = this.data.eventTables[tableName];
    if (id) {
      return table[id];
    } else {
      if (table) return table;
      else return {};
    }
  }
}
