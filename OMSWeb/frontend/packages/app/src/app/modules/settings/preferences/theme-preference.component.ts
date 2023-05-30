import { Component } from '@angular/core';
import { TrackMonitorSettingService } from '@oms/root/services/track-monitor-setting.service';
import {ISettingsCluster} from "@oms/models/settings.model";
import {forkJoin} from "rxjs";
import {tap} from "rxjs/operators";
import {SettingsService} from "@oms/services/settings.service";

@Component({
  selector: 'oms-theme-preference',
  templateUrl: './theme-preference.component.html',
  styleUrls: ['./theme-preference.component.scss'],
})
export class ThemePreferenceComponent {

  clusters: ISettingsCluster[] = [];
  constructor(private trackMonitorSettingService: TrackMonitorSettingService,
              private settingsSvc: SettingsService,) {
    this.loadClusters();
  }

  get setting() { return this.trackMonitorSettingService.trackSetting }
  get update() {return this.trackMonitorSettingService.update }

  get updateCluster() {return this.trackMonitorSettingService.updateCluster }

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

  private loadClusters() {
    return this.settingsSvc.settingsClusters().subscribe(res=>{
      this.clusters =res;
    });
  }
}
