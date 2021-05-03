import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { ISimpleResponse } from '@oms/models/base.model';
import { map, tap } from 'rxjs/operators';
import { IPlaybackData } from '../models/playback.model';

@Injectable({
  providedIn: 'root',
})
export class PlaybackService {
  private baseUrl = '/api/playback';

  playbackData$ = new Subject<IPlaybackData>();

  constructor(private http: HttpClient) {}

  firstSnapshotTime(): Observable<Date> {
    return this.http
      .get<ISimpleResponse<Date>>(`${this.baseUrl}/snapshots/first`)
      .pipe(map((res) => res.data));
  }

  loadSnapshotOfDay(start: Date, end: Date): Observable<IPlaybackData> {
    return this.http.get<IPlaybackData>(
      `${
        this.baseUrl
      }/snapshots/times/${start.toISOString()}/${end.toISOString()}`
    ).pipe(
      tap(data => {
        this.playbackData$.next(data);
      })
    );
  }
}
