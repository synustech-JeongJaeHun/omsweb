import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TrackMonitorSettingService } from '@oms/root/services/track-monitor-setting.service';
import {ClientPreferences, ToggleOptionsType} from '../../../models/settings.model';
import {SettingsService} from "@oms/services/settings.service";
import {MobileService} from "@oms/services/mobile.service";

@Component({
  selector: 'oms-show-object-dialog',
  templateUrl: './show-object-dialog.component.html',
  styleUrls: ['./show-object-dialog.component.scss'],
})
export class ShowObjectDialogComponent {
  showBackdrop =true
	preference: ClientPreferences
	enableZcuStatus = false
	
  constructor(
    public dialogRef: MatDialogRef<ShowObjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isMonitor: boolean},
    public trackSettingService: TrackMonitorSettingService,
    private settingSvc: SettingsService,
    private mobileSvc: MobileService
  ) {
    this.settingSvc.serviceConfig.subscribe((config) => {
      this.showBackdrop = config.backdrop
	    this.enableZcuStatus = config.zcuStatusIntervalSec > 0 
    })

	  this.preference = this.settingSvc.globalPreferences;
  }

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
		this.preference.save()
    this.trackSettingService.vhlStatusChanged.emit(event.checked)
  }

	public changeZcuStatusVisible(event) {
		this.preference.save()
		this.trackSettingService.zcuStatusChanged.emit(event.checked)
	}

  get isMobile(){
    return this.mobileSvc.isMobile
  }

  labelDisplayTable(type: string): string {
    return this.settingSvc.globalPreferences.controlTables[type]
  }
}
