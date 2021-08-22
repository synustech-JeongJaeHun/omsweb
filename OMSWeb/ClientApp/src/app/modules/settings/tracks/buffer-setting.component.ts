import { Component, OnInit } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { Observable } from 'rxjs';
import { SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'oms-buffer-setting',
  templateUrl: './buffer-setting.component.html',
  styleUrls: ['./buffer-setting.component.scss']
})
export class BufferSettingComponent implements OnInit {
  dataSource: DataSource;

  constructor(private settingSvc: SettingsService) {
    this.dataSource = this.settingSvc.settingsBuffersDataSource();
  }

  ngOnInit(): void {
  }

  onUpdateRow(event) { }
}
