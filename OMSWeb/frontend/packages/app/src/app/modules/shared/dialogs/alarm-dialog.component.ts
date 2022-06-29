import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import DataSource from 'devextreme/data/data_source';
import { alertSeverities, IVehicleAlarm } from '../../../models/notification.model';
import { NotificationsService } from '../../../services/notifications.service';
import { MessagesService } from '../../../services/messages.service';
import { AuthService } from '../../../services/auth.service';
import { IAnnotation } from '../../../models/annotation.model';

@Component({
  selector: 'oms-alarm-dialog',
  templateUrl: './alarm-dialog.component.html',
  styleUrls: ['./alarm-dialog.component.scss'],
})
export class AlarmDialogComponent {
  alaram_note: string;
  dataSource: DataSource;
  severityLookup = alertSeverities;
  currentItem: IVehicleAlarm;
  selectedIds: number[] = [];

  constructor(
    private auth: AuthService,
    private messageSvc: MessagesService,
    private notifySvc: NotificationsService,
    private t$: TranslateService
  ) { 
    this.dataSource = this.notifySvc.alarmsDataSource();
  }

  onClickRow(row: any) {
    const { data: { id } } = row;
    if (this.currentItem?.id === id) {
      this.currentItem = undefined;
      this.selectedIds = [];
      return;
    }
    this.currentItem = row.data;
    this.alaram_note = row.data.note;
  }

  onModifySolution() {
    let annotation: IAnnotation = {
      id: this.currentItem.id,
      referenceId: this.currentItem.errorCode,
      referenceTable: 'vehicle_errors',
      modifiedBy: this.auth.currentUser.userId,
      annotation: this.alaram_note
    }
    this.notifySvc
      .addAnnotation(annotation)
      .subscribe((res) => {
        this.dataSource = this.notifySvc.alarmsDataSource();
      });
  }

  onReset() {
    this.messageSvc
      .sendVehicleDirectCommand({ action: 'reset' }, [this.currentItem.vehicleId])
      .subscribe();
  }

  onClear() {
    this.messageSvc
      .sendAlarmClearCommand({ action: 'alarm_clear' }, [this.currentItem.vehicleId], this.currentItem.errorCode)
      .subscribe();
  }
}
