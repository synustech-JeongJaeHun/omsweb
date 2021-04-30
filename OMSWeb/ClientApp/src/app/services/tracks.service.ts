import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Dto } from '@oms/models/dto/track.model';

@Injectable({
  providedIn: 'root',
})
export class TracksService {
  private baseUrl = '/api/tracks';

  constructor(private http: HttpClient) {}

  loadGroups(): Observable<Dto.IGroup[]> {
    return this.http.get<Dto.IGroup[]>(`${this.baseUrl}/groups`);
  }

  updateGroup(id: number, group: Dto.IGroup): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/groups/${id}`, group);
  }
}
