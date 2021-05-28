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
import { DialogService } from '../../../services/dialog.service';
import { SystemsService } from '../../../services/systems.service';
import { AccountUtil } from '../utils/account.util';

@Component({
  selector: 'oms-gnb-states',
  templateUrl: './gnb-states.component.html',
  styleUrls: ['./gnb-states.component.scss'],
})
export class GnbStatesComponent implements OnInit, OnDestroy {
  private systemStates: ISystemStates;
  private destroy$ = new Subject<void>();

  get hostModeText(): string {
    return this.t$.instant(`enums.hostMode.${this.systemStates?.hostMode}`);
  }
  get tscModeText(): string {
    return this.t$.instant(`enums.tscMode.${this.systemStates?.tscMode}`);
  }
  get hostStatusIcon(): string {
    return this.systemStates?.sessionStatus === HostSessionStatusEnums.offline
      ? 'cloud_off'
      : 'cloud_queue';
  }

  get isActiveStatus(): boolean {
    return this.systemStates?.sessionStatus === HostSessionStatusEnums.online;
  }
  get isActiveHostMode(): boolean {
    return [HostModeEnums.onlineLocal, HostModeEnums.onlineRemote].includes(
      this.systemStates?.hostMode
    );
  }
  get isActiveTscMode(): boolean {
    return this.systemStates?.tscMode !== TscModeEnums.paused;
  }

  get canControl(): boolean {
    return this.auth.isAuthenticated;
  }
  get isReady(): boolean {
    return !!this.systemStates;
  }

  constructor(
    private auth: AuthService,
    private systemSvc: SystemsService,
    private dialogSvc: DialogService,
    private t$: TranslateService
  ) {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.systemSvc.currentState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((states) => (this.systemStates = states));
  }

  changeHostMode() {
    if (!AccountUtil.hasPermission(1, this.auth.currentUser)) return;
    this.dialogSvc.confirm(this.getConfirmMessage('Host')).subscribe((ok) => {
      if (ok) {
        const value = ++this.systemStates.hostMode % 4;
        this.systemSvc
          .changeStates({ hostMode: value })
          .subscribe((states) => (this.systemStates = states));
      }
    });
  }
  changeTscMode() {
    if (!AccountUtil.hasPermission(2, this.auth.currentUser)) return;
    this.dialogSvc.confirm(this.getConfirmMessage('TSC')).subscribe((ok) => {
      if (ok) {
        const value = ++this.systemStates.tscMode % 3;
        this.systemSvc
          .changeStates({ tscMode: value })
          .subscribe((states) => (this.systemStates = states));
      }
    });
  }
  changeHostStatus() {
    this.systemStates.sessionStatus = ++this.systemStates.sessionStatus % 2;
  }

  private getConfirmMessage(displayName: string) {
    const transParam = { name: displayName };
    return {
      title: this.t$.instant('names.changeConfirm', transParam),
      body: this.t$.instant('messages.changeConfirm', transParam),
    };
  }
}
