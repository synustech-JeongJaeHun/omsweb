import { Component, HostBinding, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';

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

  get toolNameShown(): boolean {
    return this.settingSvc.globalPreferences.toggles.showToolName;
  }

  get enabled(): boolean {
    return this.settingSvc.globalPreferences.toggles.showKpi;
  }

  constructor(private settingSvc: SettingsService) {}

  ngOnInit(): void {}

  onToggleExpand() {
    this.expanded = !this.expanded;
  }
}
