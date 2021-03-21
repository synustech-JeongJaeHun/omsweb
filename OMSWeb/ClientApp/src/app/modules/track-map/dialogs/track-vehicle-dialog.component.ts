import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Vehicle } from '../../../models/vehicle.model';
import { MapDataService } from '../map-data.service';

@Component({
  selector: 'oms-track-vehicle-dialog',
  templateUrl: './track-vehicle-dialog.component.html',
  styleUrls: ['./track-vehicle-dialog.component.scss'],
})
export class TrackVehicleDialogComponent implements OnInit {
  vehicles: Vehicle[] = [];
  selectedVehicle: number[] = [];

  get canTracking(): boolean {
    return this.selectedVehicle.length > 0;
  }

  constructor(
    private mapData: MapDataService,
    private dialog: MatDialogRef<TrackVehicleDialogComponent>
  ) {
    this.vehicles = this.mapData.data.vehicles;
  }

  ngOnInit(): void {}

  onTrack() {
    if (!this.canTracking) return;
    const [id] = this.selectedVehicle;
    this.dialog.close(id);
  }

  onDblClickRow(event: any) {
    this.onTrack();
  }
}
