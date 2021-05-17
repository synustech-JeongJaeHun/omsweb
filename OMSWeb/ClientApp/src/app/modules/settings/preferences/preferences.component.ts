import { Component, OnInit } from '@angular/core';
import { ToggleOptionKeyType } from '../../../models/enums';
import { ClientPreferences } from '../../../models/settings.model';
import { SettingsService } from '../../../services/settings.service';

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

  ngOnInit(): void {}

  onChangedToggle(action: ToggleOptionKeyType) {
    this.preference.save();
    // const value = this.buttonState[action];
    // this.stateSvc.changeToolbarState(action, value);
  }
}
