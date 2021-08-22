import DataSource from 'devextreme/data/data_source'
import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'oms-zcu-setting',
  templateUrl: './zcu-setting.component.html',
  styleUrls: ['./zcu-setting.component.scss'],
})
export class ZcuSettingComponent implements OnInit {
  dataSource: DataSource;
  zcuInputZoneDataSource: DataSource;

  zcuUsingTypes = [
    { type: 0, text: 'Not Use' },
    { type: 1, text: 'Use HW' },
    { type: 2, text: 'Use SW' },
  ];

  zcuInfos = [
    { priority: 32, zone: [93,92,91,90] },
    { priority: 42, zone: [93,91,90,100] },
  ];

  constructor(
    private settingSvc: SettingsService
  ) {

    /*
    this.dataSource = ([
      {
        id: 1,
        type: 1,
        completeNodes: 23.32,
        usingType: 1,
      },
      {
        id: 2,
        type: 1,
        completeNodes: 23.32,
        usingType: 0,
      },
      {
        id: 3,
        type: 1,
        completeNodes: 23.32,
        usingType: 2,
      },
    ]);
    */
    this.dataSource = this.settingSvc.settingsZcusDataSource();
  }

  ngOnInit(): void {}

  onUpdateRow(event) {}

  getZcuInputZones(value) {
    this.zcuInputZoneDataSource = this.settingSvc.settingsZcuInputZonesDataSource(value);
    //alert(this.zcuInputZoneDataSource);
    return this.zcuInputZoneDataSource;
    //return this.zcuInfos;
  }
}
