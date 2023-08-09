import { Component, HostListener, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HubService } from '../../services/hub.service';
import { SettingsService } from '../../services/settings.service';
import { setCssValue } from '../shared/utils/css-loader';
import {TTSService} from "@oms/services/tts.service";
import {SystemsService} from "@oms/services/systems.service";
import { MobileService } from '../../services/mobile.service';
import {TrackStatusService} from "@oms/services/track-status.service";
import {Router} from "@angular/router";

@Component({
  selector: 'oms-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private translate: TranslateService;
  public isInit = true
  constructor(
    $t: TranslateService,
    private hubSvc: HubService,
    private settingSvc: SettingsService,
    private ttsSvc: TTSService,

    private system:SystemsService,
    private mobile: MobileService,
    private router: Router
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

    this.system.loadControlTables();
    this.system.reference
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
    this.mobile.checkMobile(true)
  }

  get isMonitor(){
    return this.router.url.includes('/monitor')
  }
}
