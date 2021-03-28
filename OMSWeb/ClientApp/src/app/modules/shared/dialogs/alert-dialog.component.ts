import { Component, OnInit } from '@angular/core';
import { IAlert } from '../../../models/notification.model';
import { NotificationsService } from '../../../services/notifications.service';

@Component({
  selector: 'oms-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss'],
})
export class AlertDialogComponent implements OnInit {
  warnList: IAlert[] = [];

  constructor(private notifySvc: NotificationsService) {}

  ngOnInit(): void {
    this.loadWarnList();
  }

  private loadWarnList() {
    this.notifySvc.alerts().subscribe((res) => {
      this.warnList = res;
    });
  }
}
