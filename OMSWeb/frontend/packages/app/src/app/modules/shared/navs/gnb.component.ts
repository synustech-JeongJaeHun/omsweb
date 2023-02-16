import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '@oms/utils/account.util';
import { UserPermissions } from '../../../models/enums';
import { SettingsService } from '../../../services/settings.service';
import { BrowserModule, Title } from '@angular/platform-browser';

@Component({
  selector: 'oms-gnb',
  templateUrl: './gnb.component.html',
  styleUrls: ['gnb.component.scss'],
})
export class GnbComponent implements OnInit {
  version: string;
  titleText: string = 'OMS';
  get showVersion(): boolean {
    return this.settingSvc.globalPreferences.toggles.showOmsVersion;
  }

  constructor(private auth: AuthService, private settingSvc: SettingsService,
              private title:Title) { }

  ngOnInit(): void {
    this.settingSvc.serviceConfig.subscribe((config) => {
      this.version = config.version;
      this.titleText = config.titleText;
      this.title.setTitle(config.titleText+' UI')

      if (config.sid != this.auth.sid) {
        this.auth.updateSID(config.sid);
        this.auth.logout();
      }
    });
  }
}
