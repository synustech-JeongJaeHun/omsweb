import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  HostModeEnums,
  HostSessionStatusEnums,
  TscModeEnums,
} from '../../../models/enums';
import { ISystemStates } from '../../../models/system.model';
import { AuthService } from '../../../services/auth.service';
import { SystemsService } from '../../../services/systems.service';

@Component({
  selector: 'oms-gnb-states',
  templateUrl: './gnb-states.component.html',
  styleUrls: ['./gnb-states.component.scss'],
})
export class GnbStatesComponent implements OnInit {
  private systemStates: ISystemStates;

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
    private t$: TranslateService
  ) {}

  ngOnInit(): void {
    this.systemSvc.states().subscribe((states) => (this.systemStates = states));
  }

  changeHostMode() {
    const value = ++this.systemStates.hostMode % 4;
    this.systemSvc
      .changeStates({ hostMode: value })
      .subscribe((states) => (this.systemStates = states));
  }
  changeTscMode() {
    const value = ++this.systemStates.tscMode % 3;
    this.systemSvc
      .changeStates({ tscMode: value })
      .subscribe((states) => (this.systemStates = states));
  }
  changeHostStatus() {
    this.systemStates.sessionStatus = ++this.systemStates.sessionStatus % 2;
  }
}
