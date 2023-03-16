import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HubService } from '../../services/hub.service';
import { SettingsService } from '../../services/settings.service';
import { setCssValue } from '../shared/utils/css-loader';
import {TTSService} from "@oms/services/tts.service";
import {SystemsService} from "@oms/services/systems.service";

@Component({
  selector: 'oms-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private translate: TranslateService;

  constructor(
    $t: TranslateService,
    private hubSvc: HubService,
    private settingSvc: SettingsService,
    private ttsSvc: TTSService,

    private system:SystemsService,
  ) {
    this.translate = $t;

    //$t.setDefaultLang('en');
    //// $t.use($t.getBrowserCultureLang());
    //$t.use('en');


    // Default language Korean
    //this.translate.setDefaultLang('ko');
    //this.translate.use('ko');

    // Default language English
    this.translate.setDefaultLang('en');
    this.translate.use('en');

    // Default language Chinese
    //this.translate.setDefaultLang('zh');
    //this.translate.use('zh');

    this.setTheme();

    this.ttsSvc.init();

    const pref = this.settingSvc.globalPreferences;
    system.controlTables().subscribe((res)=>{
      if(res){
        Object.keys(pref.controlTables).forEach((key) => {
          if(typeof res[key] === 'boolean')
            pref.controlTables[key] = res[key]
          else if(Array.isArray(res[key])){

          }
        });
        settingSvc.globalPreferences.save()
      }
    })
  }

  private setTheme() {
    const pref = this.settingSvc.globalPreferences;
    Object.keys(pref.theme).forEach((key) => {
      setCssValue(key, pref.theme[key]);
    });
  }

  public changeLanguage(lang: string): void {
    this.translate.use(lang);
  }

  public ngOnInit(): void {
  }
}
