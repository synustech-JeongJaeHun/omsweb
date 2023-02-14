import { Component } from '@angular/core';
import {ToggleOptionKeyType, VHLIdPosition} from '../../../models/enums';
import { ClientPreferences } from '../../../models/settings.model';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'oms-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent {
  preference: ClientPreferences;
  canUseKpi = false;

  constructor(private settingSvc: SettingsService) {

    this.preference = this.settingSvc.globalPreferences;
    this.settingSvc.serviceConfig.subscribe((cfg) => {
      this.canUseKpi = cfg.kpiEnabled;
    });
  }
  onChangedToggle(action: ToggleOptionKeyType=null) {
    this.preference.save();
  }

  get VHLIdPositionKeys(): string[]{
    return Object.values(VHLIdPosition);
  }
}
