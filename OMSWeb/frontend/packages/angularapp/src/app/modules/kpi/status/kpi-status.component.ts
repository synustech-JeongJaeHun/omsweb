import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { Router } from '@angular/router';
import { HubService } from '../../../services/hub.service';
import { IDataChangeEvent } from '../../../models/notification.model';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '../../shared/utils/account.util';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'oms-kpi-status',
  templateUrl: './kpi-status.component.html',
  styleUrls: ['./kpi-status.component.scss'],
})
export class KpiStatusComponent implements OnInit, OnDestroy {
  @HostBinding('class.has-name-margin') get left() {
    return this.toolNameShown;
  }

  expanded = false;

  private enabled = false;

  //#region Subscriptions
  private destroy$: Subject<void> = new Subject<void>();
  //#endregion

  get toolNameShown(): boolean {
    return this.settingSvc.globalPreferences.toggles.showToolName;
  }

  get activated(): boolean {
    return this.enabled && this.settingSvc.globalPreferences.toggles.showKpi;
  }

  constructor(
    private auth: AuthService,
    private settingSvc: SettingsService,
    private router: Router,
    private hubSvc: HubService
  ) {
    this.settingSvc.serviceConfig.subscribe(cfg => {
      this.enabled = cfg.kpiEnabled;
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {

  }

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
