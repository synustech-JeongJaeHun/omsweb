import DataSource from 'devextreme/data/data_source';
import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'oms-segment-setting',
  templateUrl: './segment-setting.component.html',
  styleUrls: ['./segment-setting.component.scss'],
})
export class SegmentSettingComponent implements OnInit {
  dataSource: DataSource;

  constructor(
    private settingsSvc: SettingsService
  ) {    
  }

  ngOnInit(): void {
    this.init();
    this.dataSource = this.settingsSvc.settingsSegementsDataSource();
  }

  onUpdateRow(event) {}

  customSpeedRatio(cellInfo) {
    return cellInfo.value + ' %';
  }

  private init() {}
}
