import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogState,
} from '@angular/material/dialog';
import { MdePopoverTrigger } from '@material-extended/mde';

import { NotificationsService } from '@oms/services/notifications.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IAlert, IDataChangeEvent } from '../../../models/notification.model';
import { AuthService } from '../../../services/auth.service';
import { HubService } from '../../../services/hub.service';
import { AlarmDialogComponent } from '../dialogs/alarm-dialog.component';
import { AlertDialogComponent } from '../dialogs/alert-dialog.component';
import { AccountUtil } from '../utils/account.util';
import { PermissionEnums } from '../../../models/enums';

@Component({
  selector: 'oms-gnb-indicators',
  templateUrl: './gnb-indicators.component.html',
  styleUrls: ['./gnb-indicators.component.scss'],
})
export class GnbIndicatorsComponent implements OnInit, OnDestroy {
  @ViewChild(MdePopoverTrigger) btnWarn: MdePopoverTrigger;
  @ViewChild('btnAlarm', { read: ElementRef }) btnAlarm: ElementRef;

  warnCount = 0;
  alarmCount = 0;
  isCriticalWarn = false;
  isCriticalAlarm = false;
  target: any;
  isPopupWarn: boolean = false;

  warnList: IAlert[] = [];

  private _alarmDlg: MatDialogRef<AlarmDialogComponent, any>;
  private _alertDlg: MatDialogRef<AlertDialogComponent, any>;
  private destroy$: Subject<void> = new Subject<void>();
  private timerId: any;

  get warnValue(): string {
    return this.countFormat(this.warnCount);
  }

  get alarmValue(): string {
    return this.countFormat(this.alarmCount);
  }

  get hasWarn(): boolean {
    return this.warnCount > 0;
  }
  get hasAlarm(): boolean {
    return this.alarmCount > 0;
  }

  constructor(
    private notifySvc: NotificationsService,
    private hubSvc: HubService,
    private dialog: MatDialog,
    private auth: AuthService
  ) {
    this.timerId = setInterval(() => this.getState(), 5000);
  }

  ngOnInit(): void {
    this.hubSvc.alarmChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => this.onAlarmChanged(e));

    this.hubSvc.alertChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => this.onAlertChanged(e));

    this.updateAlarmCount();
    this.updateAlertCount();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerId);

    this.destroy$.next();
    this.destroy$.complete();
  }

  private getState() {
    this.notifySvc.alarmCount().subscribe((alarm) => {
      this.alarmCount = alarm.total;
      this.isCriticalAlarm = alarm.critical > 0;
    });

    this.notifySvc.alertCount().subscribe((warn) => {
      this.warnCount = warn.total;
      this.isCriticalWarn = warn.critical > 0;
      this.isPopupWarn = warn.level2 > 0;
    });
  }

  private countFormat(count: number): string {
    return count.toString();
  }

  toggleAlarmsView() {
    if (this._alarmDlg && this._alarmDlg.getState() === MatDialogState.OPEN)
      this.showAlarmsView(false);
    else
      this.showAlarmsView(true);
  }

  toggleWarnsView() {
    if (this._alertDlg && this._alertDlg.getState() === MatDialogState.OPEN)
      this.showAlertView(false);
    else
      this.showAlertView(true);
  }

  private onAlarmChanged(event: IDataChangeEvent) {
    this.updateAlarmCount();
  }

  private onAlertChanged(event: IDataChangeEvent) {
    this.updateAlertCount();
  }

  private updateAlarmCount() {
    this.notifySvc.alarmCount().subscribe((alarm) => {
      this.alarmCount = alarm.total;
      this.isCriticalAlarm = alarm.critical > 0;

      if (this.alarmCount > 0) {
        this.showAlarmsView(true);  // show

        if (this._alarmDlg?.componentInstance)
          this._alarmDlg.componentInstance.dataSource = this.notifySvc.alarmsDataSource();
      }
      else {
        setTimeout(() => {
          this.showAlarmsView(false); // hide
        }, 500);
      }
    });
  }

  private updateAlertCount() {
    this.notifySvc.alertCount().subscribe((warn) => {
      this.warnCount = warn.total;
      this.isCriticalWarn = warn.critical > 0;
      this.isPopupWarn = warn.level2 > 0;

      if (this.warnCount > 0) {
        this.showAlertView(true); // show

        if (this._alertDlg?.componentInstance)
          this._alertDlg.componentInstance.dataSource = this.notifySvc.alertsDataSource();
      }
      else {
        setTimeout(() => {
          this.showAlertView(false); // hide
        }, 500);
      }
    });
  }


  showAlarmsView(enable: boolean) {
    if (!AccountUtil.hasPermission(PermissionEnums.ViewAlarm, this.auth.currentUser)) return;
    if (enable == false) {
      if (this._alarmDlg && this._alarmDlg.getState() === MatDialogState.OPEN)
        this._alarmDlg.close();
    }
    else {
      if (this._alarmDlg && this._alarmDlg.getState() === MatDialogState.OPEN) {
        return;
      }

      const rect: DOMRect = this.btnAlarm.nativeElement.getBoundingClientRect();
      this._alarmDlg = this.dialog.open(AlarmDialogComponent, {
        // width: '700px',
        autoFocus: false,
        hasBackdrop: false,
        disableClose: true,
        closeOnNavigation: true,
        panelClass: 'alarms-dialog',
        position: {
          top: `${rect.top + rect.height}px`,
          left: `${rect.left - 600}px`,
        },
      });
    }
  }

  showAlertView(enable: boolean) {
    if (!AccountUtil.hasPermission(PermissionEnums.ViewWarning, this.auth.currentUser)) return;
    if (enable == false) {
      if (this._alertDlg && this._alertDlg.getState() === MatDialogState.OPEN)
        this._alertDlg.close();
    }
    else {
      if (this._alertDlg && this._alertDlg.getState() === MatDialogState.OPEN) {
        return;
      }

      this._alertDlg = this.dialog.open(AlertDialogComponent, {
        autoFocus: false,
        hasBackdrop: false,
        disableClose: true,
        closeOnNavigation: true,
        panelClass: 'alerts-dialog',
      });
    }
  }

}
