import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TrackMonitorSettingService } from '@oms/root/services/track-monitor-setting.service';
import { ToggleOptionsType } from '../../../models/settings.model';
import {MobileService} from "@oms/services/mobile.service";

@Component({
  selector: 'oms-show-object-dialog',
  templateUrl: './show-object-dialog.component.html',
  styleUrls: ['./show-object-dialog.component.scss'],
})
export class ShowObjectDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ShowObjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public buttonState: ToggleOptionsType,
    public trackSettingService: TrackMonitorSettingService,

    private mobileSvc: MobileService
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

  public changeVhlStatusVisible(event) {
    this.trackSettingService.vhlStatusChanged.emit(event.checked);
    this.update({
      key: 'isVhlStatusVisible',
      value: event.checked
    });
  }

  get isMobile(){
    return this.mobileSvc.isMobile
  }
}
