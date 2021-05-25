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
  selector: 'oms-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent implements OnInit {
  preference: ClientPreferences;
  themeItems: { name: string; style: string }[] = [
    { name: 'homeBgColor', style: '--monitor-background-color' },
    { name: 'playbackBgColor', style: '--playback-background-color' },
    { name: 'station', style: '--station-color' },
    { name: 'buffer', style: '--buffer-color' },
    { name: 'point', style: '--point-color' },
    { name: 'vehiclePath', style: '--expected-path-color' },
    { name: 'segmentNormal', style: '--segment-color' },
    { name: 'segmentDisabled', style: '--segment-color-disabled' },
    { name: 'segmentDirection', style: '--segment-direction-color' },
  ];

  resetThemeTargets: string[] = [];

  get canResetTheme(): boolean {
    return this.resetThemeTargets.length > 0;
  }

  constructor(private settingSvc: SettingsService) {
    this.preference = this.settingSvc.globalPreferences;
  }

  ngOnInit(): void {
    this.loadTheme();
  }

  onSelectResetTheme({ value }) {
    this.resetThemeTargets = value;
  }

  onResetTheme() {
    this.resetThemeTargets.forEach((x) => {
      removeCssValue(x);
      delete this.preference.theme[x];
      this.preference.save();
    });
    this.resetThemeTargets = [];
  }

  onChangedToggle(action: ToggleOptionKeyType) {
    this.preference.save();
  }

  private loadTheme() {}
}
