import { Component, OnInit } from '@angular/core';
import { IVehicleAlarm } from '../../../models/notification.model';
import { NotificationsService } from '../../../services/notifications.service';

@Component({
  selector: 'oms-alarm-dialog',
  templateUrl: './alarm-dialog.component.html',
  styleUrls: ['./alarm-dialog.component.scss'],
})
export class AlarmDialogComponent implements OnInit {
  alarmList: IVehicleAlarm[] = [];

  constructor(private notifySvc: NotificationsService) {}

  ngOnInit(): void {
    this.notifySvc.alarms().subscribe((res) => {
      this.alarmList = res;
    });
  }
}
