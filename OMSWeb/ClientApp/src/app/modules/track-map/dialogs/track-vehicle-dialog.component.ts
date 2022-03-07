import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TrackStatusService } from '@oms/root/services/track-status.service';
import { Observable, of } from 'rxjs';
import { ILookupUnit } from '../../../models/map.interface';
import { Vehicle } from '../../../models/vehicle.model';

@Component({
  selector: 'oms-track-vehicle-dialog',
  templateUrl: './track-vehicle-dialog.component.html',
  styleUrls: ['./track-vehicle-dialog.component.scss'],
})
export class TrackVehicleDialogComponent {
  dataSource: Observable<ILookupUnit[]>;
  vehicles: Vehicle[] = [];
  selectedVehicle: number[] = [];

  get canTracking(): boolean {
    return this.selectedVehicle.length > 0;
  }

  constructor(
    trackStatusService: TrackStatusService,
    private dialog: MatDialogRef<TrackVehicleDialogComponent>
  ) {
    this.dataSource = of(trackStatusService.trackData.vehicles);
  }

  onTrack() {
    if (!this.canTracking) return;
    const [id] = this.selectedVehicle;
    this.dialog.close(id);
  }
}
