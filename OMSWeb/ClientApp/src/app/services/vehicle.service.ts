import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  IRecentVehicleDio,
  IVehicleDioCategory,
  IVehicleDioHistory,
  IVehicleStatus,
} from '../models/vehicle-status.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private baseUrl = '/api/vehicle';
  constructor(private http: HttpClient) {}

  getRecentVehicleDio(vehicleId: number): Observable<IRecentVehicleDio> {
    return this.http.get<IRecentVehicleDio>(
      `${this.baseUrl}/${vehicleId}/recent-dio`
    );
  }
  getVehicleStatus(vehicleId: number): Observable<IVehicleStatus> {
    return this.http.get<IVehicleStatus>(`${this.baseUrl}/${vehicleId}/status`);
  }

  getVehicleDioHistories(
    vehicleId: number,
    from: Date,
    to: Date
  ): Observable<IVehicleDioHistory[]> {
    return this.http.get<IVehicleDioHistory[]>(
      `${this.baseUrl}/${vehicleId}/dio`,
      {
        params: {
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }
    );
  }

  getVehicleDioCategories() {
    return this.http.get<IVehicleDioCategory[]>(
      `${this.baseUrl}/dio-categories`
    );
  }
}
