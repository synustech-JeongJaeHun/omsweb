import { Component, OnInit } from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import { alertSeverities, IVehicleAlarm } from '../../../models/notification.model';
import { NotificationsService } from '../../../services/notifications.service';

@Component({
  selector: 'oms-alarm-dialog',
  templateUrl: './alarm-dialog.component.html',
  styleUrls: ['./alarm-dialog.component.scss'],
})
export class AlarmDialogComponent implements OnInit {
  dataSource: DataSource;
  severityLookup = alertSeverities;
  currentItem: IVehicleAlarm;
  selectedIds: number[] = [];

  constructor(private notifySvc: NotificationsService) {}

  ngOnInit(): void {
    this.dataSource = this.notifySvc.alarmsDataSource();
  }

  onClickRow(row: any) {
    const {data: {id}} = row;
    if (this.currentItem?.id === id) {
      this.currentItem = undefined;
      this.selectedIds = [];
      return;
    }
    this.currentItem = row.data;
  }
}
