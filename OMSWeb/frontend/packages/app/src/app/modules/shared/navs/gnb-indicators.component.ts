import {
  Component,
  ElementRef, HostListener,
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
import {finalize, takeUntil} from 'rxjs/operators';
import { IAlert, IDataChangeEvent } from '../../../models/notification.model';
import { AuthService } from '../../../services/auth.service';
import { HubService } from '../../../services/hub.service';
import { AlarmDialogComponent } from '../dialogs/alarm-dialog.component';
import { AlertDialogComponent } from '../dialogs/alert-dialog.component';
import {PermissionEnums, ToggleLockOptionKeyType} from '../../../models/enums';
import {TTSService} from "@oms/services/tts.service";
import {MobileService} from "@oms/services/mobile.service";
import {SettingsService} from "@oms/services/settings.service";
import {MessagesService} from "@oms/services/messages.service";
import {DialogService} from "@oms/services/dialog.service";
import {TranslateService} from "@ngx-translate/core";
import {ClientPreferences, ToggleLockOptionsType} from "@oms/models/settings.model";
import {SystemsService} from "@oms/services/systems.service";

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

  warnClicked = false;
  warnList: IAlert[] = [];
  indicatorFireEmergency = false
  fireEmergency = false
  toggleLocks: ToggleLockOptionsType
  preference: ClientPreferences

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
    private auth: AuthService,
    private tts: TTSService,
    private mobileSvc: MobileService,
    private settingSvc: SettingsService,
    private dialogSvc: DialogService,
    private $t: TranslateService,
    private messageSvc: MessagesService,
    private systemSvc: SystemsService
  ) {
    settingSvc.serviceConfig.subscribe(config=>{
      this.indicatorFireEmergency = config?.indicatorFireEmergency
    })
    this.preference = this.settingSvc.globalPreferences
    this.toggleLocks = this.settingSvc.globalPreferences.toggleLocks;
  }

  ngOnInit(): void {
	  this.systemSvc.systemState().subscribe(res=>{
		  this.fireEmergency = res.fireEmergency
	  })
		
    this.hubSvc.alarmChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => this.onAlarmChanged(e));

    this.hubSvc.alertChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => this.onAlertChanged(e));

    this.hubSvc.systemState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => {
        this.fireEmergency = e.fireEmergency
      });

    this.timerId = setInterval(() => this.getState(), 5000);

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
      if(this.alarmCount>0){
        this.tts.start(this.alarmCount)
      }
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
    if (this._alertDlg && this._alertDlg.getState() === MatDialogState.OPEN){
      this.showAlertView(false);
      this.warnClicked = false;
    }
    else{
      this.showAlertView(true);
      this.warnClicked = true;
    }
  }

  private onAlarmChanged(event: IDataChangeEvent) {
    this.updateAlarmCount();
  }

  private onAlertChanged(event: IDataChangeEvent) {
    this.updateAlertCount();
  }

  private updateAlarmCount(beforeCheck=false) {
    this.notifySvc.alarmCount()
      .subscribe((alarm) => {
        if(beforeCheck&&(this.alarmCount === alarm.total)) return;
      this.alarmCount = alarm.total;
      this.isCriticalAlarm = alarm.critical > 0;
      if (this.alarmCount > 0) {
        !this.toggleLocks.alarm && this.showAlarmsView(true);  // show

        if (this._alarmDlg?.componentInstance)
          this._alarmDlg.componentInstance.dataSource.reload()
      }
      else {
        setTimeout(() => {
          this.showAlarmsView(false); // hide
        }, 500);
      }
    });
  }

  private updateAlertCount(beforeCheck=false) {
    this.notifySvc.alertCount().subscribe((warn) => {
      if(beforeCheck&&(this.warnCount === warn.total)) return;

      this.warnCount = warn.total;
      this.isCriticalWarn = warn.critical > 0;
      this.isPopupWarn = warn.level2 > 0;

      if (this.warnCount > 0) {
        !this.toggleLocks.warning && this.showAlertView(true); // show

        if (this._alertDlg?.componentInstance)
          this._alertDlg.componentInstance.dataSource.reload()
      }
      else {
        setTimeout(() => {
          this.showAlertView(false); // hide
        }, 500);
      }
    });
  }


  showAlarmsView(enable: boolean) {
    //if (!AccountUtil.hasPermission(PermissionEnums.ViewAlarm, this.auth.currentUser)) return;
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
        autoFocus: false,
        hasBackdrop: false,
        disableClose: true,
        closeOnNavigation: true,
        panelClass: 'alarms-dialog',
        minWidth: !this.mobileSvc.isMobile ?'auto': '100%',
        position: !this.mobileSvc.isMobile ?
          {
            top: `${rect.top + rect.height}px`,
            left: `${rect.left - 600}px`,
          } :
          {
            bottom: '0px',
            left: '0px'
          },
      });
    }
  }

  showAlertView(enable: boolean) {
    //if (!AccountUtil.hasPermission(PermissionEnums.ViewWarning, this.auth.currentUser)) return;
    if (enable == false && !this.warnClicked) {
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
        minWidth: !this.mobileSvc.isMobile ?'auto': '100%',
        minHeight: !this.mobileSvc.isMobile ?'auto': '60%',
        position: this.mobileSvc.isMobile &&
          {
            bottom: '0px'
          },
      });
      this._alertDlg.afterClosed().subscribe(result=>{
        this.warnClicked = false
      })
    }
  }

  get hasControlAccess(): boolean {
    return this.auth.isAuthenticated
  }
  sendRelease() {
    if (!this.hasControlAccess) return
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmCommand') })
      .subscribe((ok) => {
        ok &&
        this.messageSvc
          .sendRelease()
          .subscribe()
      })
  }


  @HostListener('document:visibilitychange', ['$event'])
  private visibilitychange() {
    if(!document.hidden){
      this.updateAlarmCount(true)
      this.updateAlertCount(true)
      this.timerId = setInterval(() => this.getState(), 5000);
    }
    else{
      clearInterval(this.timerId)
    }
  }

  toggleLocking($event, key: ToggleLockOptionKeyType = 'warning'){
    $event.preventDefault()
    this.preference.toggleLocks[key] = !this.preference.toggleLocks[key]
    this.preference.save();
  }

}
