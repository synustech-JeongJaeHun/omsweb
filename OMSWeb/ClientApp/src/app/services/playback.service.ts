import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ISimpleResponse } from '@oms/models/base.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PlaybackService {
  private baseUrl = '/api/playback';

  constructor(private http: HttpClient) {}

  firstSnapshotTime(): Observable<Date> {
    return this.http
      .get<ISimpleResponse<Date>>(`${this.baseUrl}/snapshots/first`)
      .pipe(map((res) => res.data));
  }

  loadSnapshotOfDay(start: Date, end: Date) {
    return this.http.get(
      `${
        this.baseUrl
      }/snapshots/times/${start.toISOString()}/${end.toISOString()}`
    );
  }
}
