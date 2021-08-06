import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { EMPTY, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IKeyValuePair } from '../models/base.model';
import { AlertSeverities } from '../models/enums';
import { IIdObject } from '../models/base.model';
import { IAnnotation } from '../models/annotation.model';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';

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
    return this.http
      .get<INotificationCount>(`${this.baseUrl}/alert-count`)
      .pipe(map((res) => new NotificationCount(res)));
  }
  alarmCount(): Observable<NotificationCount> {
    return this.http
      .get<INotificationCount>(`${this.baseUrl}/alarm-count`)
      .pipe(map((res) => new NotificationCount(res)));
  }

  alerts(
    status: string = 'NOT_CLEAR',
    level: string = 'ALL',
    keyword: string = '*'
  ): Observable<IAlert[]> {
    // @TODO api 작업 후 삭제
    console.error('# form get-alerts.json file - for test #');
    return this.http.get<IAlert[]>('/assets/json/get-alerts.json');
    // return this.http.get<IAlert[]>(
    //   `${this.baseUrl}/alerts/${status}/${level}/${keyword}`
    // );
  }
  // alarms(): Observable<IVehicleAlarm[]> {
  //   // @TODO api 작업 후 삭제
  //   // console.error('# form get-alarms.json file - for test #');
  //   // return this.http.get<IVehicleAlarm[]>('/assets/json/get-alarms.json');
  //   return this.http.get<IVehicleAlarm[]>(
  //     `${this.baseUrl}/alarms/${status}/${level}/${keyword}`
  //   );
  // }

  alarmsDataSource(): DataSource {
    return new DataSource({
      store: AspNetData.createStore({
        key: 'id',
        loadUrl: `${this.baseUrl}/alarms`,
      }),
    });

  }

  clearAlerts(ids: number[]): Observable<void> {
    console.error('@@ TODO : clear alert api 구현 필요');
    return EMPTY;
  }

  clearAlarm(id: number): Observable<void> {
    return this.http
      .put<void>(`${this.baseUrl}/clearalarm`, id);
  }

  addAnnotation(form: IAnnotation): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/addannotation`, form);

    //alert(`${this.baseUrl}/addannotation2`);
    //alert(form.referenceId + ' - ' + form.referenceTable + ' - ' + form.modifiedBy + ' - ' + form.annotation);

    //const httpOptions = {
    //  headers: new HttpHeaders({
    //    'Content-Type': 'application/x-www-form-urlencoded'
    //  })
    //};

    //return this.http
    //  .post<IIdObject>(`${this.baseUrl}/addannotation`, form, httpOptions);


    //return this.http
    //  .post<IIdObject>(`${this.baseUrl}/addannotation`, form, httpOptions).subscribe(
    //    res => console.log(res),
    //    error => console.error(error)
    //  );
  }

  //addAnnotation3(form: IAnnotation): Observable<void> {
  //  const httpOptions = {
  //    headers: new HttpHeaders({
  //      'Content-Type': 'application/x-www-form-urlencoded'
  //    })
  //  };

  //  //return this.http.post<void>(`${this.baseUrl}/addannotation3`, form, httpOptions).pipe(      
  //  //);
  //  return this.http.post<void>(`${this.baseUrl}/addannotation4`, 1, httpOptions).pipe(
  //}
}
