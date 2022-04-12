import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { ILookupUnit } from '../../../models/map.interface';
import { Vehicle } from '../../../models/vehicle.model';
import { TrackIdService } from '../../../services/track-id.service';

@Component({
  selector: 'oms-legacy-track-vehicle-dialog',
  templateUrl: './legacy-track-vehicle-dialog.component.html',
  styleUrls: ['./legacy-track-vehicle-dialog.component.scss'],
})
export class LegacyTrackVehicleDialogComponent implements OnInit {
  dataSource: Observable<ILookupUnit[]>;
  vehicles: Vehicle[] = [];
  selectedVehicle: number[] = [];

  get canTracking(): boolean {
    return this.selectedVehicle.length > 0;
  }

  constructor(
    private idSvc: TrackIdService,
    private dialog: MatDialogRef<LegacyTrackVehicleDialogComponent>
  ) {
    this.dataSource = of(
      Object.values(this.idSvc.find_matched_target_object('vehicle'))
    );
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
