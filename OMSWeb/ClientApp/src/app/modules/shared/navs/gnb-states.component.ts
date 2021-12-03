import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  HostModeEnums,
  HostSessionStatusEnums,
  TscModeEnums,
} from '../../../models/enums';
import { ISystemStates } from '../../../models/system.model';
import { AuthService } from '../../../services/auth.service';
import { HubService } from '../../../services/hub.service';
import { DialogService } from '../../../services/dialog.service';
import { SystemsService } from '../../../services/systems.service';
import { AccountUtil } from '../utils/account.util';
import { MessagesService } from '../../../services/messages.service';
import { IDataChangeEvent } from '../../../models/notification.model';
import { PermissionEnums } from '../../../models/enums';

@Component({
  selector: 'oms-gnb-states',
  templateUrl: './gnb-states.component.html',
  styleUrls: ['./gnb-states.component.scss'],
})
export class GnbStatesComponent implements OnInit, OnDestroy {
  private systemStates: ISystemStates;
  private destroy$ = new Subject<void>();

  get hostStatusIcon(): string {
    return this.systemStates?.sessionStatus === HostSessionStatusEnums.DISCONNECTED
      ? 'cloud_off'
      : 'cloud_queue';
  }
  get hostModeText(): string {
    return this.t$.instant(`enums.hostMode.${this.systemStates?.hostMode}`);
  }
  get tscModeText(): string {
    return this.t$.instant(`enums.tscMode.${this.systemStates?.tscMode}`);
  }

  get isActiveStatus(): boolean {
    return this.systemStates?.sessionStatus === HostSessionStatusEnums.CONNECTED;
  }
  get isActiveHostMode(): boolean {
    return this.systemStates?.hostMode == HostModeEnums.HOST;
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
    private messageSvc: MessagesService
  ) { }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.hubSvc.modeStateChanged$
      .pipe(takeUntil(this.destroy$))
      .subscribe((e) => this.onModeStateChanged(e));

    this.systemSvc.currentState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((states) => (this.systemStates = states));
  }

  changeHostMode() {
    //if (!AccountUtil.hasPermission(1, this.auth.currentUser)) return;
    if (!AccountUtil.hasPermission(PermissionEnums.HostMode, this.auth.currentUser)) return;
    this.dialogSvc.confirm(this.getConfirmMessage('Host')).subscribe((ok) => {
      if (ok) {
        this.messageSvc.sendControlStateCommand({ action: 'control_state', state: 'change' }).subscribe();
      }
    });
  }
  changeTscMode() {
    //if (!AccountUtil.hasPermission(2, this.auth.currentUser)) return;
    if (!AccountUtil.hasPermission(PermissionEnums.TscMode, this.auth.currentUser)) return;
    this.dialogSvc.confirm(this.getConfirmMessage('TSC')).subscribe((ok) => {
      if (ok) {
        this.messageSvc.sendTscStateCommand({ action: 'tsc_state', state: 'change' }).subscribe();
      }
    });
  }

  private getConfirmMessage(displayName: string) {
    const transParam = { name: displayName };
    return {
      title: this.t$.instant('names.changeConfirm', transParam),
      body: this.t$.instant('messages.changeConfirm', transParam),
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
