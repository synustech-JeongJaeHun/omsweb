import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TrackMonitorSettingService } from '@oms/root/services/track-monitor-setting.service';
import { ToggleOptionsType } from '../../../models/settings.model';

@Component({
  selector: 'oms-show-object-dialog',
  templateUrl: './show-object-dialog.component.html',
  styleUrls: ['./show-object-dialog.component.scss'],
})
export class ShowObjectDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ShowObjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public buttonState: ToggleOptionsType,
    public trackSettingService: TrackMonitorSettingService
  ) {}

  public get Math() {
    return Math;
  }

  public get setting() {
    return this.trackSettingService.trackSetting;
  }

  public get update() {
    return this.trackSettingService.update;
  }

  public changeRotation(event) {
    this.trackSettingService.rotationChanged.emit(event.value);
    this.update({ key: 'rotation', value: event.value });
  }
}
