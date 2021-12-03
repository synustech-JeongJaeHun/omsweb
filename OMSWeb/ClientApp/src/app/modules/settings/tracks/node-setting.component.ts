import DataSource from 'devextreme/data/data_source';
import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { NodeDirectionNames } from '../../../models/enums';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'oms-node-setting',
  templateUrl: './node-setting.component.html',
  styleUrls: ['./node-setting.component.scss'],
})
export class NodeSettingComponent implements OnInit {
  dataSource: DataSource;

  constructor(
    private settingsSvc: SettingsService
  ) {
  }

  ngOnInit(): void {
    this.dataSource = this.settingsSvc.settingsPointsDataSource();
  }

  onUpdateRow(event) { }

  transformNodeDirection(data: any) {
    return NodeDirectionNames[data.value];
  }
}
