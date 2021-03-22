import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  IAlert,
  INotificationCount,
  IVehicleAlarm,
  NotificationCount,
} from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private baseUrl = '/api/notifications';

  constructor(private http: HttpClient) {}

  alertCount(): Observable<NotificationCount> {
    // @TODO api 작업 후 삭제
    console.error('# form alert-count.json file - for test #');
    return this.http
      .get<INotificationCount>('/assets/json/alert-count.json')
      .pipe(
        map((res) => {
          return new NotificationCount(res);
        })
      );
    // return this.http.get<INotificationCount>(`${this.baseUrl}/alert-count`)
  }
  alarmCount(): Observable<NotificationCount> {
    // @TODO api 작업 후 삭제
    console.error('# form alarm-count.json file - for test #');
    return this.http
      .get<INotificationCount>('/assets/json/alarm-count.json')
      .pipe(
        map((res) => {
          return new NotificationCount(res);
        })
      );
    // return this.http.get<INotificationCount>(`${this.baseUrl}/alarm-count`)
  }

  alerts(
    status: string = 'NOT_CLEAR',
    level: string = 'ALL',
    keyword: string = '*'
  ): Observable<IAlert[]> {
    // @TODO api 작업 후 삭제
    console.error('# form get-alerts.json file - for test #');
    return this.http
      .get<IAlert[]>('/assets/json/get-alerts.json');
    // return this.http.get<IAlert[]>(
    //   `${this.baseUrl}/alerts/${status}/${level}/${keyword}`
    // );
  }
  alarms(): Observable<IVehicleAlarm[]> {
    // @TODO api 작업 후 삭제
    console.error('# form get-alarms.json file - for test #');
    return this.http
      .get<IVehicleAlarm[]>('/assets/json/get-alarms.json');
    // return this.http.get<IVehicleAlarm[]>(
    //   `${this.baseUrl}/alarms/${status}/${level}/${keyword}`
    // );
  }
}
