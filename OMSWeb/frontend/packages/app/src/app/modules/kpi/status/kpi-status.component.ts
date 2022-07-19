import { Component, HostBinding, OnDestroy } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ReportService } from '../../../services/report.service';
import { AccountUtil } from '../../shared/utils/account.util';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'oms-kpi-status',
  templateUrl: './kpi-status.component.html',
  styleUrls: ['./kpi-status.component.scss'],
})
export class KpiStatusComponent implements OnDestroy {
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

  utilization = 0;
  deliveryTime = 0;
  cpuGhz = 0;
  cpuPercentage = 0;
  memoryTotal = 0;
  memoryUsed = 0;
  memoryPercentage = 0;

  constructor(
    private auth: AuthService,
    private settingSvc: SettingsService,
    private router: Router,
    private reportService: ReportService
  ) {
    this.settingSvc.serviceConfig.subscribe(cfg => {
      this.enabled = cfg.kpiEnabled;
    })
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(e => this.reportService.loadTrend().subscribe(res => {
        this.utilization = res.utilization.value;
        this.deliveryTime = res.delivery_time.value;
        this.cpuGhz = res.cpu.ghz;
        this.cpuPercentage = res.cpu.usage;
        this.memoryTotal = res.memory.total;
        this.memoryUsed = res.memory.used;
        this.memoryPercentage = res.memory.usedPercent;
      }))
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
