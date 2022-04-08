import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import DataSource from 'devextreme/data/data_source';
import { NotificationsService } from '../../../services/notifications.service';

@Component({
  selector: 'oms-alarm-setting',
  templateUrl: './alarm-setting.component.html',
  styleUrls: ['./alarm-setting.component.scss'],
})
export class AlarmSettingComponent implements OnInit {
  dataSource: DataSource;

  constructor(
    private notifySvc: NotificationsService
  ) {
  }

  ngOnInit(): void {
    this.dataSource = this.notifySvc.vehicleErrorsDataSource();
  }
}
