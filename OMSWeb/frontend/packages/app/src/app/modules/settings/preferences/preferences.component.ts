import { Component } from '@angular/core';
import {ToggleOptionKeyType, VHLIdPosition} from '../../../models/enums';
import { ClientPreferences } from '../../../models/settings.model';
import { SettingsService } from '../../../services/settings.service';
import {LangCode} from "@oms/models/tts.model";
import {TTSService} from "@oms/services/tts.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'oms-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent {
  preference: ClientPreferences;
  canUseKpi = false;

  constructor(private settingSvc: SettingsService, private ttsSvc: TTSService, private t$: TranslateService) {

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

  get LangCodeKeys(): string[]{
    return Object.values(LangCode);
  }

  saveTTS(action: ToggleOptionKeyType=null){
    this.onChangedToggle(action)
    this.ttsSvc.setLanguage(this.preference.tts.language)
  }
}
