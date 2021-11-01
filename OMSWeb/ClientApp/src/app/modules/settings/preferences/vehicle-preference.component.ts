import { Component, OnInit } from '@angular/core';
import { ToggleOptionKeyType } from '../../../models/enums';
import { ClientPreferences } from '../../../models/settings.model';
import { SettingsService } from '../../../services/settings.service';
import {
  getCss,
  main_css,
  removeCssValue,
  setCssValue,
} from '../../shared/utils/css-loader';

@Component({
  selector: 'oms-vehicle-preference',
  templateUrl: './vehicle-preference.component.html',
  styleUrls: ['./vehicle-preference.component.scss'],
})
export class VehiclePreferenceComponent implements OnInit {

  preference: ClientPreferences;
  vehicleModeItems: { name: string; style: string }[] = [
    { name: 'VehicleModeAutoBgColor', style: '--vehicle-color-mode-auto' },
    { name: 'VehicleModeManualBgColor', style: '--vehicle-color-mode-manual' },
    { name: 'VehicleModeNoneBgColor', style: '--vehicle-color-mode-none' }
  ];
  vehicleCargoStatusItems: { name: string, style: string }[] = [
    { name: 'VehicleCargoStatusLoadingColor', style: '--vehicle-foup-loading-color' },
    { name: 'VehicleCargoStatusFullColor', style: '--vehicle-foup-color' },
    { name: 'VehicleCargoStatusUnloadingColor', style: '--vehicle-foup-unloading-color' }
  ];

  resetVehicleModeThemeTargets: string[] = [];
  resetVehicleCargoStatusItemsTargets: string[] = [];

  get canResetVehicleModeTheme(): boolean {
    return this.resetVehicleModeThemeTargets.length > 0;
  }
  get canResetVehicleCargoStatusTheme(): boolean {
    return this.resetVehicleCargoStatusItemsTargets.length > 0;
  }

  constructor(private settingSvc: SettingsService) {
    this.preference = this.settingSvc.globalPreferences;
  }

  ngOnInit(): void { }

  onSelectResetVehicleModeTheme({ value }) {
    this.resetVehicleModeThemeTargets = value;
  }
  onSelectResetVehicleCargoStatusTheme({ value }) {
    this.resetVehicleCargoStatusItemsTargets = value;
  }

  onResetVehicleModeTheme() {
    this.resetVehicleModeThemeTargets.forEach((x) => {
      removeCssValue(x);
      delete this.preference.theme[x];
      this.preference.save();
    });
    this.resetVehicleModeThemeTargets = [];
  }
  onResetVehicleCargoStatusTheme() {
    this.resetVehicleCargoStatusItemsTargets.forEach((x) => {
      removeCssValue(x);
      delete this.preference.theme[x];
      this.preference.save();
    });
    this.resetVehicleCargoStatusItemsTargets = [];
  }

  onChangedToggle(action: ToggleOptionKeyType) {
    this.preference.save();
  }

  private loadTheme() { }
}
