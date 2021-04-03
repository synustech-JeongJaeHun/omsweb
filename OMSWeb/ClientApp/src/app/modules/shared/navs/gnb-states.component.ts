import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HostModeEnums, HostSessionStatusEnums, TscModeEnums } from '../../../models/enums';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'oms-gnb-states',
  templateUrl: './gnb-states.component.html',
  styleUrls: ['./gnb-states.component.scss'],
})
export class GnbStatesComponent implements OnInit {
  private hostMode: HostModeEnums = HostModeEnums.offline;
  private hostStatus: HostSessionStatusEnums = HostSessionStatusEnums.offline;
  private tscMode: TscModeEnums = TscModeEnums.auto;

  get hostModeText(): string {
    return this.t$.instant(`enums.hostMode.${this.hostMode}`);
  }
  get tscModeText(): string {
    return this.t$.instant(`enums.tscMode.${this.tscMode}`);
  }
  get hostStatusIcon(): string {
    return this.hostStatus === HostSessionStatusEnums.offline ? 'cloud_off': 'cloud_queue';
  }

  get isActiveStatus(): boolean {
    return this.hostStatus === HostSessionStatusEnums.online;
  }
  get isActiveHostMode(): boolean {
    return [HostModeEnums.onlineLocal, HostModeEnums.onlineRemote].includes(this.hostMode);
  }
  get isActiveTscMode(): boolean {
    return this.tscMode !== TscModeEnums.paused;
  }

  get canControl() {
    return this.auth.isAuthenticated;
  }

  constructor(private auth: AuthService, private t$: TranslateService) {}

  ngOnInit(): void {}

  changeHostMode() {
    this.hostMode = ++this.hostMode % 4;
  }
  changeTscMode() {
    this.tscMode = ++this.tscMode % 3;
  }
  changeHostStatus() {
    this.hostStatus = ++this.hostStatus % 2;
  }
}
