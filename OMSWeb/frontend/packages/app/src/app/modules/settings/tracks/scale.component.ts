import { Component, OnInit } from '@angular/core';
import {TrackMonitorSettingService} from "@oms/services/track-monitor-setting.service";
import {ClientPreferences} from "@oms/models/settings.model";
import {SettingsService} from "@oms/services/settings.service";
import {TrackStatusService} from "@oms/services/track-status.service";

@Component({
  selector: 'oms-scale',
  templateUrl: './scale.component.html',
	styleUrls: ['./scale.component.scss'],
})
export class ScaleComponent implements OnInit {

	preference: ClientPreferences
	bufferExists = false
	zcuExists = false
	
  constructor(
	  public trackSettingService: TrackMonitorSettingService,
	  public settingSvc: SettingsService,
	  public track: TrackStatusService
  ) { }

	public get setting() {
		return this.trackSettingService.trackSetting;
	}

	public get update() {
		return this.trackSettingService.update;
	}

  ngOnInit(): void {
	  this.preference = this.settingSvc.globalPreferences
	  this.bufferExists = this.track.trackData.buffers.length > 0
	  this.zcuExists = this.track.trackData.zcus.length > 0
  }

	labelDisplayTable(type: string): string {
		return this.preference.controlTables[type]
	}

}
