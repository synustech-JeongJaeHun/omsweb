import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';

import { ISimpleResponse } from '@oms/models/base.model';
import { map, mergeMap, tap } from 'rxjs/operators';
import { IPlaybackData, ISnapshotData } from '../models/playback.model';

@Injectable({
  providedIn: 'root',
})
export class PlaybackService {
  private baseUrl = '/api/playback';

  playbackData$ = new Subject<IPlaybackData>();
  snapshotUpdated$ = new Subject<ISnapshotData>();

  // instance properties
  // eventVersion: number;

  constructor(private http: HttpClient) {}

  firstSnapshotTime(): Observable<Date> {
    // this.eventVersion = 0;
    return this.http
      .get<ISimpleResponse<Date>>(`${this.baseUrl}/snapshots/first`)
      .pipe(
        tap((res) => {
          if (!res.data) {
            // return throwError('Snapshot is not exists.');
            throw new Error('Snapshot is not exists.');
          }
        }),
        map((res) => res.data)
      );
  }

  playbackDataSet(start: Date, end: Date): Observable<IPlaybackData> {
    const url = `${
      this.baseUrl
    }/snapshots/times/${start.toISOString()}/${end.toISOString()}`;
    return this.http.get<IPlaybackData>(url).pipe(
      tap((data) => {
        this.playbackData$.next(data);
      })
    );
  }

  snapshot(track: Date, snapshot: Date): Observable<ISnapshotData> {
    const url = `${this.baseUrl}/snapshots/${track}/${snapshot}`;
    return this.http.get<ISnapshotData>(url);
    // .pipe(tap((res) => this.snapshotUpdated$.next(res)));
  }
}
