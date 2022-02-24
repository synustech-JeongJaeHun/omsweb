import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TrackSettingService } from '@oms/root/services/track-setting.service';
import { ToggleOptionsType } from '../../../models/settings.model';

@Component({
  selector: 'oms-show-object-dialog',
  templateUrl: './show-object-dialog.component.html',
  styleUrls: ['./show-object-dialog.component.scss'],
})
export class ShowObjectDialogComponent {
  slideValues = {
    vehicleScale: 3,
    mapRotation: 0,
    segmentWidth: 2,
    segmentDirectionSize: 2,
  };

  @Output() rotationChanged = new EventEmitter<number>()
  @Output() scaleChanged = new EventEmitter<{
    type: "Vehicle" | "SegmentWidth" | "SegmentDirection",
    value: number
  }>()
  @Output() visibleChanged = new EventEmitter<{
    type: "VehicleLine" | "SegmentDirection" | "PointLabel" | "Station" | "Buffer" | "Group" | "Cluster" | "OverlappingObjects",
    value: boolean
  }>()

  constructor(
    public dialogRef: MatDialogRef<ShowObjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public buttonState: ToggleOptionsType,
    public trackSettingService: TrackSettingService
  ) { }
}
