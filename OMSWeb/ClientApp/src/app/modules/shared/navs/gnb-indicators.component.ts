import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MatDialogState,
} from '@angular/material/dialog';
import { MdePopoverTrigger } from '@material-extended/mde';

import { NotificationsService } from '@oms/services/notifications.service';
import { IAlert } from '../../../models/notification.model';
import { AlarmDialogComponent } from '../dialogs/alarm-dialog.component';
@Component({
  selector: 'oms-gnb-indicators',
  templateUrl: './gnb-indicators.component.html',
  styleUrls: ['./gnb-indicators.component.scss'],
})
export class GnbIndicatorsComponent implements OnInit {
  @ViewChild(MdePopoverTrigger) btnWarn: MdePopoverTrigger;
  @ViewChild('btnAlarm', { read: ElementRef }) btnAlarm: ElementRef;

  warnCount = 0;
  alarmCount = 0;
  isCriticalWarn = false;
  isCriticalAlarm = false;
  target: any;

  warnList: IAlert[] = [];

  private _alarmDlg: MatDialogRef<AlarmDialogComponent, any>;

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
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.notifySvc.alarmCount().subscribe((alarm) => {
      this.alarmCount = alarm.total;
      this.isCriticalAlarm = alarm.critical > 0;
    });

    this.notifySvc.alertCount().subscribe((warn) => {
      this.warnCount = warn.total;
      this.isCriticalWarn = warn.critical > 0;
      this.warnCount && this.loadWarnList();
    });
  }

  toggleWarnsView() {
    this.btnWarn.togglePopover();
  }
  toggleAlarmsView() {
    if (this._alarmDlg && this._alarmDlg.getState() === MatDialogState.OPEN) {
      this._alarmDlg.close();
      return;
    }

    const rect: DOMRect = this.btnAlarm.nativeElement.getBoundingClientRect();
    console.info('## alarm rect >>', rect);
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

  private loadWarnList() {
    this.notifySvc.alerts().subscribe((res) => {
      this.warnList = res;
    });
  }
}
