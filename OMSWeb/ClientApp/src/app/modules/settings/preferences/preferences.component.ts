import { Component, OnInit } from '@angular/core';
import { ToggleOptionKeyType } from '../../../models/enums';
import { ClientPreferences } from '../../../models/settings.model';
import { SettingsService } from '../../../services/settings.service';
import { getCss, main_css, setCssValue } from '../../shared/utils/css-loader';

@Component({
  selector: 'oms-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent implements OnInit {
  preference: ClientPreferences;

  constructor(private settingSvc: SettingsService) {
    this.preference = this.settingSvc.globalPreferences;
  }

  ngOnInit(): void {
    this.loadTheme();
  }

  onChangedToggle(action: ToggleOptionKeyType) {
    this.preference.save();
  }

  onChangedTheme(name: string, value: any) {
    setCssValue(name, value);
    this.preference.theme[name] = value;
    this.preference.save();
  }

  getThemeValue(name: string) {
    return this.preference.theme[name] || getCss(name);
  }

  private loadTheme() {}
}
