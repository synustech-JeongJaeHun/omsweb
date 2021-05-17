import { Component, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HubService } from '../../services/hub.service';
import { SettingsService } from '../../services/settings.service';
import { setCssValue } from '../shared/utils/css-loader';
import { MapDataService } from '../track-map/map-data.service';

@Component({
  selector: 'oms-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @HostListener('document:visibilitychange', ['$event'])
  visibilitychange() {
    if (document.hidden) {
      this.hubSvc.stop();
    } else {
      this.hubSvc.start();
    }
  }

  constructor(
    $t: TranslateService,
    private hubSvc: HubService,
    private settingSvc: SettingsService
  ) {
    $t.setDefaultLang('en');
    // $t.use($t.getBrowserCultureLang());
    $t.use('en');

    this.setTheme();
  }

  private setTheme() {
    const pref = this.settingSvc.globalPreferences;
    Object.keys(pref.theme).forEach((key) => {
      setCssValue(key, pref.theme[key]);
    });
  }
}
