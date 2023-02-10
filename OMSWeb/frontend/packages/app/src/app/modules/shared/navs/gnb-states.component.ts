import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HostModeEnums, HostSessionStatusEnums, OnOfflineModeEnums, OnlineModeEnums, TscModeEnums, } from '../../../models/enums';
import { ISystemStates } from '../../../models/system.model';
import { AuthService } from '../../../services/auth.service';
import { HubService } from '../../../services/hub.service';
import { DialogService } from '../../../services/dialog.service';
import { SystemsService } from '../../../services/systems.service';
import { AccountUtil } from '../utils/account.util';
import { MessagesService } from '../../../services/messages.service';
import { IDataChangeEvent } from '../../../models/notification.model';
import { PermissionEnums } from '../../../models/enums';
import {SettingsService} from "@oms/services/settings.service";

@Component({
  selector: 'oms-gnb-states',
  templateUrl: './gnb-states.component.html',
  styleUrls: ['./gnb-states.component.scss'],
})
export class GnbStatesComponent implements OnInit, OnDestroy {
  private timerId: any;
  private systemStates: ISystemStates;
  private destroy$ = new Subject<void>();
  onOffLine: boolean = false

  get hostStatusIcon(): string {
    if (!this.isActiveConnStatus)
      return 'cloud_off'
    if(this.onOffLine){
      if (this.isActiveOnlineMode){
        if (this.isActiveHostMode) return 'cloud_done'
        return 'cloud'
      }
      return 'cloud_queue';
    }
    else {
      if (this.isActiveOnlineMode){
        return 'cloud_done'
      }
      return 'cloud_queue';
    }
  }
  get connectStateText(): string {
    let connected: number = (this.systemStates?.sessionStatus % 1000);
    let onlineStatus: number = this.systemStates?.sessionStatus - connected;

    if (connected == HostSessionStatusEnums.DISCONNECTED) return this.t$.instant(`names.disconnected`);
    else if (connected == HostSessionStatusEnums.CONNECTED) return this.t$.instant(`names.connected`);

    return this.t$.instant(`names.disconnected`);
  }
  get controlStateText(): string {
    let connected: number = (this.systemStates?.sessionStatus % 1000);
    let onlineStatus: number = this.systemStates?.sessionStatus - connected;

    if (onlineStatus == (OnOfflineModeEnums.AttemptOnline * 1000)) return this.t$.instant(`names.online`);
    else if (onlineStatus == (OnOfflineModeEnums.HostOffline * 1000)) return this.t$.instant(`names.online`);
    else if (onlineStatus == (OnOfflineModeEnums.HostOffline * 1000)) return this.t$.instant(`names.online`);
    else if (onlineStatus == (OnOfflineModeEnums.HostOffline * 1000)) return this.t$.instant(`names.online`);
    else if (onlineStatus == (OnOfflineModeEnums.HostOffline * 1000)) return this.t$.instant(`names.online`);
    else
      return this.t$.instant(`names.offline`);
  }

  get onofflineModeText(): string {
    return this.t$.instant((this.isActiveOnlineMode || this.isAttemptOnlineMode) ? `names.online` : `names.offline`)
  }

  get hostModeText(): string {
    return this.t$.instant((this.onOffLine? 'enums.hostModeRemote.' : 'enums.hostMode.')+`${this.systemStates?.hostMode}`);
  }

  get tscModeText(): string {
    return this.t$.instant(`enums.tscMode.${this.systemStates?.tscMode}`);
  }
  get onlineParamTitle(): string {
    return this.t$.instant(`names.onlineMode`);
  }
  get onlineParamText(): string[] {
    if (this.isActiveOnlineMode)
      return [this.t$.instant(`names.online`), this.t$.instant('names.offline')];
    return [this.t$.instant(`names.offline`), this.t$.instant('names.online')];
  }
  get hostParamTitle(): string {
    if (this.isActiveHostMode)
      return this.t$.instant(`names.host`);
    return this.t$.instant(`names.local`);
  }
  get hostParamText(): string[] {
    const key = this.onOffLine? `names.remote` :`names.host`
    if (this.isActiveHostMode)
      return [this.t$.instant(key), this.t$.instant('names.local')];
    return [this.t$.instant(`names.local`), this.t$.instant(key)];
  }
  get tscParamTitle(): string {
    return this.t$.instant(`names.tsc`);
  }
  get tscParamText(): string[] {
    if (this.isActiveTscMode)
      return [this.t$.instant(`names.tscAuto`), this.t$.instant('names.tscPause')];
    return [this.t$.instant(`names.tscPause`), this.t$.instant('names.tscAuto')];
  }
  get isActiveConnStatus(): boolean {
    return this.systemStates?.sessionStatus % 1000 == HostSessionStatusEnums.CONNECTED;
  }
  get isActiveOnlineMode(): boolean {
    return this.systemStates?.sessionStatus == (HostSessionStatusEnums.CONNECTED + OnOfflineModeEnums.Online * 1000);
  }

  get isAttemptOnlineMode(): boolean {
    return this.systemStates?.sessionStatus == (HostSessionStatusEnums.CONNECTED + OnOfflineModeEnums.AttemptOnline * 1000);
  }

  get isActiveStatus(): boolean {
    return this.systemStates?.sessionStatus === HostSessionStatusEnums.CONNECTED;
  }

  get isActiveHostMode(): boolean {
    return this.systemStates?.hostMode === HostModeEnums.HOST;
  }
  get isActiveTscMode(): boolean {
    return this.systemStates?.tscMode === TscModeEnums.AUTO;
  }

  get canControl(): boolean {
    return this.auth.isAuthenticated;
  }
  get isReady(): boolean {
    return !!this.systemStates;
  }

  constructor(
    private hubSvc: HubService,
    private auth: AuthService,
    private systemSvc: SystemsService,
    private dialogSvc: DialogService,
    private t$: TranslateService,
    private messageSvc: MessagesService,
    private settingSvc: SettingsService,
  ) {
    this.getState();

    this.timerId = setInterval(() => this.updateState(), 5000);

    settingSvc.serviceConfig.subscribe(
      (config) => (this.onOffLine = config.onOffLine),
    )
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    clearInterval(this.timerId);

    this.destroy$.next();
    this.destroy$.complete();
  }

  private getState() {
    this.hubSvc.modeStateChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => this.onModeStateChanged(e));

    this.systemSvc.currentState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((states) => (this.systemStates = states));
  }

  changeOnlineMode() {
    if (!AccountUtil.hasPermission(PermissionEnums.HostMode, this.auth.currentUser)) return;
    this.dialogSvc.confirm(this.getConfirmMessage(this.onlineParamTitle, this.onlineParamText)).subscribe((ok) => {
      if (ok) {
        this.messageSvc.sendOnlineStateCommand({ action: 'online_state', state: 'change' }).subscribe();
      }
    });
  }
  changeHostMode() {
    if (!AccountUtil.hasPermission(PermissionEnums.HostMode, this.auth.currentUser)) return;
    this.dialogSvc.confirm(this.getConfirmMessage(this.hostParamTitle, this.hostParamText)).subscribe((ok) => {
      if (ok) {
        this.messageSvc.sendControlStateCommand({ action: 'control_state', state: 'change' }).subscribe();
      }
    });
  }
  changeTscMode() {
    if (!AccountUtil.hasPermission(PermissionEnums.TscMode, this.auth.currentUser)) return;
    this.dialogSvc.confirm(this.getConfirmMessage(this.tscParamTitle, this.tscParamText)).subscribe((ok) => {
      if (ok) {
        this.messageSvc.sendTscStateCommand({ action: 'tsc_state', state: 'change' }).subscribe();
      }
    });
  }

  private getConfirmMessage(displayName: string, param: string[]) {
    const transParam = { name: displayName, from: param[0], to: param[1] };
    return {
      title: this.t$.instant('names.changeConfirm', transParam),
      body: this.t$.instant('messages.changeStateConfirm', transParam),
    };
  }

  private updateState() {
    this.systemSvc.currentState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((states) => (this.systemStates = states));
  }

  private onModeStateChanged(event: IDataChangeEvent) {
    setTimeout(() => {
      this.updateState();
    }, 80);
  }
}
