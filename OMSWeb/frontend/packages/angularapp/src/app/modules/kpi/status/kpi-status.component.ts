import { Component, HostBinding, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '../../shared/utils/account.util';

@Component({
  selector: 'oms-kpi-status',
  templateUrl: './kpi-status.component.html',
  styleUrls: ['./kpi-status.component.scss'],
})
export class KpiStatusComponent implements OnInit {
  @HostBinding('class.has-name-margin') get left() {
    return this.toolNameShown;
  }

  expanded = false;

  private enabled = false;

  get toolNameShown(): boolean {
    return this.settingSvc.globalPreferences.toggles.showToolName;
  }

  get activated(): boolean {
    return this.enabled && this.settingSvc.globalPreferences.toggles.showKpi;
  }

  constructor(
    private auth: AuthService,
    private settingSvc: SettingsService,
    private router: Router
  ) {
    this.settingSvc.serviceConfig.subscribe(cfg => {
      this.enabled = cfg.kpiEnabled;
    })
  }

  ngOnInit(): void { }

  onToggleExpand() {
    this.expanded = !this.expanded;
  }

  onClick(target: string) {
    //need to add permission 42
    //if (this.hasPermission(42) == true) {
    if (!this.auth.isAuthenticated) return;

    if (target == "kpi") {
      this.router.navigate(["/reports/kpi"]);
      //} else if (target == "systeminfo") {
      //  this.router.navigate(["/reports/systeminfo"]);
    } else {
      this.router.navigate(["/reports/normalTR"]);
    }
    //}
  }

  hasPermission(permission: number): boolean {
    return AccountUtil.hasPermission(permission, this.auth.currentUser);
  }
}
