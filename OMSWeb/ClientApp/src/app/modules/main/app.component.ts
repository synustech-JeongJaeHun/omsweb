import { Component } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'oms-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor($t: TranslateService) {
    $t.setDefaultLang('en');
    // $t.use($t.getBrowserCultureLang());
    $t.use('en');
  }
}
