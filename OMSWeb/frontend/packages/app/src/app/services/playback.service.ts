import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as DateFns from 'date-fns';
import {
  PlaybackSnapshotData,
  PlaybackTrackData,
  TimelineEvent,
} from '../models/playback.model';

@Injectable({
  providedIn: 'root',
})
export class PlaybackService {
  private baseUrl = '/api/playback';

  constructor(private http: HttpClient) {}

  getPlaybackInfo() {
    type Response = {
      firstSnapshotTime: string;
      lastTimelineEventTime: string;
    };
    return this.http.get<Response>(`${this.baseUrl}/info`).pipe(
      map((res) => ({
        firstSnapshotTime: new Date(res.firstSnapshotTime),
        lastTimelineEventTime: new Date(res.lastTimelineEventTime),
      }))
    );
  }

  getTrackTimes() {
    return this.http
      .get<string[]>(`${this.baseUrl}/track-times`)
      .pipe(map((res) => res.map((dateAsString) => new Date(dateAsString))));
  }

  getRecentTrack(before: Date) {
    return this.http
      .get<{
        timestamp: string;
        data: string;
      }>(
        `${this.baseUrl}/recent-track/${DateFns.add(before, {
          seconds: 1,
        }).toISOString()}`
      )
      .pipe(
        map((res) => ({
          timestamp: new Date(res.timestamp),
          data: JSON.parse(res.data) as PlaybackTrackData,
        }))
      );
  }

  getBeforeNextSnapshots(from: Date) {
    return this.http
      .get<{
        before?: { timestamp: string; data: string };
        next?: { timestamp: string; data: string };
      }>(`${this.baseUrl}/before-next-snapshots/${from.toISOString()}`)
      .pipe(
        map((res) => ({
          before: res.before
            ? {
                timestamp: new Date(res.before.timestamp),
                data: JSON.parse(res.before.data) as PlaybackSnapshotData,
              }
            : undefined,
          next: res.next
            ? {
                timestamp: new Date(res.next.timestamp),
                data: JSON.parse(res.next.data) as PlaybackSnapshotData,
              }
            : undefined,
        }))
      );
  }

  getTimelineEvents(from: Date, to: Date) {
    return this.http.get<TimelineEvent[]>(
      `${
        this.baseUrl
      }/timeline-events?from=${from.toISOString()}&to=${to.toISOString()}`
    );
  }
}
