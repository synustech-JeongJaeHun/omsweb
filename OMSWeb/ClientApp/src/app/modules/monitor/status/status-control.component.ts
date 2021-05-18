import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserPermissions } from '../../../models/enums';
import { AuthService } from '../../../services/auth.service';
import { DialogService } from '../../../services/dialog.service';
import { MessagesService } from '../../../services/messages.service';
import { SettingsService } from '../../../services/settings.service';
import { AccountUtil } from '../../shared/utils/account.util';
import { MapStatesService } from '../../track-map/map-states.service';

@Component({
  selector: 'oms-status-control',
  templateUrl: './status-control.component.html',
  styleUrls: ['./status-control.component.scss'],
})
export class StatusControlComponent implements OnInit {
  resizeHandler: any;
  tableHeightNum = 300;

  get tableHeight(): string {
    return this.tableHeightNum.toString();
  }
  get canControl(): boolean {
    return (
      this.auth.isAuthenticated &&
      AccountUtil.hasPermission(
        UserPermissions.controlActions,
        this.auth.currentUser
      )
    );
  }

  tabNames = [
    { id: 1, title: 'Orders' },
    { id: 2, title: 'Vehicles' },
  ];
  currentTab: number = 0;

  constructor(
    private auth: AuthService,
    private mapStateSvc: MapStatesService,
    private messageSvc: MessagesService,
    private settingSvc: SettingsService,
    private dialogSvc: DialogService,
    private $t: TranslateService
  ) {}

  ngOnInit(): void {
    this.resizeHandler = this.onMouseMove.bind(this);
    this.currentTab = this.settingSvc.globalPreferences.uiStates.controlTab;
  }

  onPing() {
    this.messageSvc.sendVehicleCommand({ action: 'status' }).subscribe();
  }
  onVehicleReset() {
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmResetAllVehicles') })
      .subscribe((confirm) => {
        if (confirm) {
          this.messageSvc.sendVehicleCommand({ action: 'reset' }).subscribe();
        }
      });
  }
  onSetAuto() {
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmSetAutoAll') })
      .subscribe((confirm) => {
        if (confirm) {
          this.messageSvc
            .sendVehicleCommand({ action: 'initialize' })
            .subscribe();
        }
      });
  }
  onEStop() {
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmEstopAll') })
      .subscribe((confirm) => {
        if (confirm) {
          this.messageSvc.sendVehicleCommand({ action: 'stop' }).subscribe();
        }
      });
  }

  onMouseMove(event) {
    let resizedH = window.innerHeight - event.clientY;
    if (resizedH < 40) {
      resizedH = 40;
      this.resizeViewerStop(event);
    } else if (resizedH > window.innerHeight) {
      resizedH = window.innerHeight;
      window.removeEventListener('mousemove', this.resizeHandler);
    }
    document.getElementById('status-control-container').style.height =
      resizedH + 'px';

    this.tableHeightNum = resizedH - 37; /* header:40px, tab-panel:25px */
  }
  onChangeTab(selectedIndex: number) {
    const pref = this.settingSvc.globalPreferences;
    pref.uiStates.controlTab = selectedIndex;
    this.settingSvc.globalPreferences.save();
  }

  resizeViewerStart() {
    window.addEventListener('mousemove', this.resizeHandler);
  }

  resizeViewerStop(event) {
    if (event.type === 'mouseleave') {
      if (window.innerHeight - event.clientY < 0) {
        window.removeEventListener('mousemove', this.resizeHandler);
      }
    }
    if (event.type === 'mouseup') {
      window.removeEventListener('mousemove', this.resizeHandler);
    }

    this.mapStateSvc.statusTableResizeEvent$.next();
  }

  viewerHide() {
    this.mapStateSvc.changeToolbarState('controlTable', false);
  }
  shrinkViewer() {
    const height = document.getElementById('status-control-container').style
      .height;
    if (height === '40px') {
      document.getElementById('status-control-container').style.height =
        '365px';
      this.tableHeightNum = 300;
    } else {
      document.getElementById('status-control-container').style.height = '40px';
      this.tableHeightNum = 0;
    }
  }
}
