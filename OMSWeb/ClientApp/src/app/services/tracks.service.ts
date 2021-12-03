import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Dto } from '@oms/models/dto/track.model';

@Injectable({
  providedIn: 'root',
})
export class TracksService {
  private baseUrl = '/api/tracks';

  constructor(private http: HttpClient) { }

  loadGroups(): Observable<Dto.IGroup[]> {
    return this.http.get<Dto.IGroup[]>(`${this.baseUrl}/groups`);
  }

  updateGroup(id: number, group: Dto.IGroup): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/groups/${id}`, group);
  }

  loadClusters(): Observable<Dto.ICluster[]> {
    return this.http.get<Dto.ICluster[]>(`${this.baseUrl}/clusters`);
  }

  updateCluster(id: number, cluster: Dto.ICluster): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/clusters/${id}`, cluster);
  }

  loadSegments(): Observable<Dto.ISegment[]> {
    return this.http.get<Dto.ISegment[]>(`${this.baseUrl}/segments`);
  }

  loadPoints(): Observable<Dto.IPoint[]> {
    return this.http.get<Dto.IPoint[]>(`${this.baseUrl}/points`);
  }
  updatePoint(id: number, point: any) {
    return this.http.patch<void>(`${this.baseUrl}/points/${id}`, point);
  }

  loadStations(): Observable<Dto.IStation[]> {
    return this.http.get<Dto.IStation[]>(`${this.baseUrl}/stations`);
  }

  installBufferCarrier(bufferId: number, carrierId: number): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/buffers/${bufferId}/carrier/${carrierId}`,
      {}
    );
  }

  removeBufferCarrier(bufferId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/buffers/${bufferId}/carrier`
    );
  }

  updateBuffer(bufferId: number, form: any): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/buffers/${bufferId}`, form);
  }
  updateZcu(id: number, form: any): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/zcus/${id}`, form);
  }
}
