import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import DataSource from 'devextreme/data/data_source';
import { alertSeverities, IVehicleAlarm } from '../../../models/notification.model';
import { DialogService } from '../../../services/dialog.service';
import { NotificationsService } from '../../../services/notifications.service';
import { MessagesService } from '../../../services/messages.service';
import { AuthService } from '../../../services/auth.service';
import { IAnnotation } from '../../../models/annotation.model';

@Component({
  selector: 'oms-alarm-dialog',
  templateUrl: './alarm-dialog.component.html',
  styleUrls: ['./alarm-dialog.component.scss'],
})
export class AlarmDialogComponent implements OnInit {
  alaram_note: string;
  dataSource: DataSource;
  severityLookup = alertSeverities;
  currentItem: IVehicleAlarm;
  selectedIds: number[] = [];

  constructor(
    private auth: AuthService,
    private messageSvc: MessagesService,
    private notifySvc: NotificationsService,
    private dialogSvc: DialogService,
    private t$: TranslateService
  ) {}

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
    this.alaram_note = '';
  }

  onModifySolution() {
    //this.dialogSvc
    //  .confirm({ body: this.t$.instant('messages.confirmCommand') })
    //  .subscribe((ok) => {
    //    if (ok) {
          // db update or insert to annotations and update vehicle_alarms time_resolved
          //alert('modifySolution [' + this.currentItem.vehicleId + '] : ' + this.currentItem.errorCode + ' - vehicle_errors - ' + this.auth.currentUser.userId + ' - ' + this.alaram_note);
    let annotation: IAnnotation = {
      referenceId: this.currentItem.errorCode,
      referenceTable: 'vehicle_errors',
      modifiedBy: this.auth.currentUser.userId,
      annotation: this.alaram_note,
      vehicleAlaramId: this.currentItem.id
    }
    this.notifySvc.addAnnotation(annotation).subscribe();
    //    }
    //  });    
  }

  onReset() {
    //this.dialogSvc
    //  .confirm({ body: this.t$.instant('messages.confirmCommand') })
    //  .subscribe((ok) => {
    //    if (ok) {
          // send vehicle reset message
          //alert('reset : ' + this.currentItem.id + ' - ' + this.currentItem.vehicleId);
    let vehicleIds: number[] = [ this.currentItem.vehicleId ];
    this.messageSvc.sendVehicleIDsCommand({ action: 'reset' }, vehicleIds).subscribe();
    //    }
    //  });
  }

  onClear() {
    //this.dialogSvc
    //  .confirm({ body: this.t$.instant('messages.confirmCommand') })
    //  .subscribe((ok) => {
    //    if (ok) {
          // send vehicle_manager alarm_clear message
          //alert('clear : ' + this.currentItem.id + ' - ' + this.currentItem.vehicleId);
    this.messageSvc.sendVehicleMangerCommand({ action: 'alarm_clear' }, this.currentItem.vehicleId, this.currentItem.errorCode).subscribe();
    //    }
    //  });
  }
}
