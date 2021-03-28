import { Component, HostListener } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HubService } from '../../services/hub.service';
import { MapDataService } from '../track-map/map-data.service';

@Component({
  selector: 'oms-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @HostListener('document:visibilitychange', ['$event'])
  visibilitychange() {
    console.info(`document hidden : ${document.hidden}`);
    if (document.hidden) {
      this.hubSvc.stop();
    } else {
      this.hubSvc.start();
    }
  }

  constructor($t: TranslateService, private hubSvc: HubService) {
    $t.setDefaultLang('en');
    // $t.use($t.getBrowserCultureLang());
    $t.use('en');
  }
}
