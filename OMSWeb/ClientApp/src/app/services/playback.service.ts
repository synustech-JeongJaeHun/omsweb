import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';

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

  ordersChanged$ = new BehaviorSubject<any[]>([]);
  vehiclesChanged$ = new BehaviorSubject<any[]>([]);

  private _orders = [];
  private _vehicles = [];

  // instance properties
  // eventVersion: number;

  constructor(private http: HttpClient) {}

  firstSnapshotTime(): Observable<Date> {
    this.ordersChanged$.next([]);
    this.vehiclesChanged$.next([]);

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
        this.changeOrders([...data.orders], false);
        this.changeVehicles([...data.vehicles], false);
        this.playbackData$.next(data);
      })
    );
  }

  snapshot(track: Date, snapshot: Date): Observable<ISnapshotData> {
    const url = `${this.baseUrl}/snapshots/${track}/${snapshot}`;
    return this.http.get<ISnapshotData>(url).pipe(
      tap((data) => {
        this.changeOrders([...data.orders], false);
        this.changeVehicles([...data.vehicles], false);
      })
    );
  }

  updateOrderTable(
    operation: string,
    delta: any,
    id: number,
    skipRender: boolean
  ) {
    if (operation === 'INSERT') {
      this._orders.push(delta);
    } else if (operation === 'DELETE' || operation === 'UPDATE') {
      this._orders = this._orders.filter((x) => x.id !== id);
      if (operation === 'UPDATE') {
        this._orders.push(delta);
      }
    }
    this.changeOrders(this._orders, skipRender);
  }
  updateVehicleTable(
    operation: string,
    delta: any,
    id: number,
    skipRender: boolean
  ) {
    if (operation === 'INSERT') {
      this._vehicles.push(delta);
    } else if (operation === 'DELETE' || operation === 'UPDATE') {
      this._vehicles = this._vehicles.filter((x) => x.id !== id);
      if (operation === 'UPDATE') {
        this._vehicles.push(delta);
      }
    }
    this.changeVehicles(this._vehicles, skipRender);
  }

  private changeOrders(data: any[], skipRender: boolean) {
    this._orders = data;
    !skipRender && this.ordersChanged$.next(this._orders);
  }
  private changeVehicles(data: any[], skipRender: boolean) {
    this._vehicles = data;
    !skipRender && this.vehiclesChanged$.next(this._vehicles);
  }
}
