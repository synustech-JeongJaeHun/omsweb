import { Component } from '@angular/core';
import {ToggleOptionKeyType, VHLIdPosition, PointType, IdType, ToggleLockOptionKeyType} from '../../../models/enums';
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
  //canUseKpi = false;

  public VHLIdPosition = VHLIdPosition;
  public PointType = PointType;
  public IdType = IdType;

  constructor(private settingSvc: SettingsService, private ttsSvc: TTSService, private t$: TranslateService) {

    this.preference = this.settingSvc.globalPreferences;
    this.loadKpiEnabled();
  }
  onChangedToggle(action: ToggleOptionKeyType | ToggleLockOptionKeyType=null) {
    this.preference.save();
    if(action==='showKpi'){
      this.settingSvc.saveKpiEnabled(this.preference.toggles.showKpi).subscribe(res=>{
        this.loadKpiEnabled();
      })
    }
  }

  loadKpiEnabled(){
    this.settingSvc.getKpiEnabled().subscribe((cfg) => {
      this.preference.toggles.showKpi = cfg;
      this.preference.save();
    });
  }

  objectValues(obj: any): string[]{
    return Object.values(obj);
  }

  get LangCodeKeys(): string[]{
    return Object.values(LangCode);
  }

  saveTTS(action: ToggleOptionKeyType=null){
    this.onChangedToggle(action)
    this.ttsSvc.setLanguage(this.preference.tts.language)
  }
}
