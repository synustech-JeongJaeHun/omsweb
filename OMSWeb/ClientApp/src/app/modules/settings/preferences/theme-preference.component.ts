import { Component } from '@angular/core';
import { TrackMonitorSettingService } from '@oms/root/services/track-monitor-setting.service';

@Component({
  selector: 'oms-theme-preference',
  templateUrl: './theme-preference.component.html',
  styleUrls: ['./theme-preference.component.scss'],
})
export class ThemePreferenceComponent {
  constructor(private trackMonitorSettingService: TrackMonitorSettingService) { }

  get setting() { return this.trackMonitorSettingService.trackSetting }
  get update() {return this.trackMonitorSettingService.update }

  resetBasicThemeTargets: string[] = [];
  resetVehicleModeThemeTargets: string[] = [];
  resetVehicleCargoStatusItemsTargets: string[] = [];

  onResetBasicTheme() {
    this.resetBasicThemeTargets.forEach(this.trackMonitorSettingService.reset)
    this.resetBasicThemeTargets = [];
  }
  onResetVehicleModeTheme() {
    this.resetVehicleModeThemeTargets.forEach(this.trackMonitorSettingService.reset);
    this.resetVehicleModeThemeTargets = [];
  }
  onResetVehicleCargoStatusTheme() {
    this.resetVehicleCargoStatusItemsTargets.forEach(this.trackMonitorSettingService.reset);
    this.resetVehicleCargoStatusItemsTargets = [];
  }
}
