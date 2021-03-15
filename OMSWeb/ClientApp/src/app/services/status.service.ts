import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import {Dto} from '@oms/models/dto/track.model';

@Injectable({
  providedIn: 'root',
})
export class StatusService {
  private baseUrl = '/api/status';
  constructor(private http: HttpClient) {}

  getTrack(): Observable<Dto.ITrackData> {
    // return this.http.get<Dto.ITrackData>(`${this.baseUrl}/track`);
    // @TODO assets/json/status-track.json 파일 삭제
    console.error('# form json file - for test #');
    return this.http.get('/assets/json/status-track.json');
  }
}
