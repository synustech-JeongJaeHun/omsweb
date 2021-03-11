import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MonitorService {
  private baseUrl = '/api/monitor';
  constructor(private http: HttpClient) {}
}
