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

  warnList: IAlert[] = [];

  private _alarmDlg: MatDialogRef<AlarmDialogComponent, any>;
  private _alertDlg: MatDialogRef<AlertDialogComponent, any>;
  private destroy$: Subject<void> = new Subject<void>();

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
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  toggleWarnsView() {
    //if (!AccountUtil.hasPermission(9, this.auth.currentUser)) return;
    if (!AccountUtil.hasPermission(PermissionEnums.ViewWarning, this.auth.currentUser)) return;
    // this.btnWarn.togglePopover();
    if (this._alertDlg && this._alertDlg.getState() === MatDialogState.OPEN) {
      this._alertDlg.close();
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

  toggleAlarmsView(enforce = false) {
    //if (!AccountUtil.hasPermission(8, this.auth.currentUser)) return;
    if (!AccountUtil.hasPermission(PermissionEnums.ViewAlarm, this.auth.currentUser)) return;
    if (this._alarmDlg && this._alarmDlg.getState() === MatDialogState.OPEN) {
      this._alarmDlg.close();
      if (!enforce) return;
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

  private countFormat(count: number): string {
    return count.toString();
    // if (count > 1000000) {
    //   return `${Math.floor(count / 1000000)}M`;
    // }
    // if (count > 1000) {
    //   return `${Math.floor(count / 1000)}K`;
    // }
    // return count.toString();
  }

  showAlarmsView() {
    //if (!AccountUtil.hasPermission(8, this.auth.currentUser)) return;
    if (!AccountUtil.hasPermission(PermissionEnums.ViewAlarm, this.auth.currentUser)) return;
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

  private updateAlertCount() {
    this.notifySvc.alertCount().subscribe((warn) => {
      this.warnCount = warn.total;
      this.isCriticalWarn = warn.critical > 0;
    });
  }
  private updateAlarmCount() {
    this.notifySvc.alarmCount().subscribe((alarm) => {
      this.alarmCount = alarm.total;
      this.isCriticalAlarm = alarm.critical > 0;
    });
  }
  updateAlarmView(show = true) {
    //if (!AccountUtil.hasPermission(8, this.auth.currentUser)) return;
    if (!AccountUtil.hasPermission(PermissionEnums.ViewAlarm, this.auth.currentUser)) return;
    if (show) this.showAlarmsView();

    this._alarmDlg.componentInstance.dataSource = this.notifySvc.alarmsDataSource();
  }


  private onAlertChanged(event: IDataChangeEvent) {
    this.updateAlertCount();
  }
  private onAlarmChanged(event: IDataChangeEvent) {
    this.updateAlarmCount();
    this.updateAlarmView(true);
    //this.toggleAlarmsView(true);
  }
}
