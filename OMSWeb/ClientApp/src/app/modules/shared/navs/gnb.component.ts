import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '@oms/utils/account.util';
import { UserPermissions } from '../../../models/enums';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'oms-gnb',
  templateUrl: './gnb.component.html',
  styleUrls: ['gnb.component.scss'],
})
export class GnbComponent implements OnInit {
  version: string;

  get showGnb(): boolean {
    return (
      this.auth.isAuthenticated &&
      AccountUtil.hasPermission(UserPermissions.gnb, this.auth.currentUser)
    );
  }

  get showVersion(): boolean {
    return this.settingSvc.globalPreferences.toggles.showOmsVersion;
  }

  constructor(private auth: AuthService, private settingSvc: SettingsService) {}

  ngOnInit(): void {
    this.settingSvc.serviceConfig.subscribe((config) => {
      this.version = config.version;
    });
  }
}
