import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  defaultToggleOptions,
  ToggleOptionsType,
} from '@oms/models/settings.model';
import {
  CommandKeyType,
  ToggleOptionKeyType,
  UserPermissions,
} from '../../../models/enums';

import { MapStatesService } from '../map-states.service';
import { MessagesService } from '@oms/services/messages.service';
import { DialogService } from '@oms/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { SearchDialogComponent } from '../dialogs/search-dialog.component';
import { BufferStatusDialogComponent } from '../dialogs/buffer-status-dialog.component';
import { VehicleStatusDialogComponent } from '../dialogs/vehicle-status-dialog.component';
import {
  MatDialog,
  MatDialogRef,
  MatDialogState,
} from '@angular/material/dialog';
import { TrackVehicleDialogComponent } from '../dialogs/track-vehicle-dialog.component';
import { CommandDialogComponent } from '../dialogs/command-dialog.component';
import { ShowObjectDialogComponent } from '../dialogs/show-object-dialog.component';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '../../shared/utils/account.util';
import { SettingsService } from '../../../services/settings.service';
import { PermissionEnums } from '../../../models/enums';

@Component({
  selector: 'oms-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['map-toolbar.component.scss'],
})
export class MapToolbarComponent implements OnInit, OnDestroy {
  @Input()
  buttonState: ToggleOptionsType = defaultToggleOptions;
  readonly permissionEnums: typeof PermissionEnums = PermissionEnums;

  @ViewChild('btnSearch', { read: ElementRef }) btnSearch: ElementRef;
  @ViewChild('btnTrack', { read: ElementRef }) btnTrack: ElementRef;
  @ViewChild('btnCommand', { read: ElementRef }) btnCommand: ElementRef;
  @ViewChild('btnShowObj', { read: ElementRef }) btnShowObj: ElementRef;

  visibilityOpen = false;

  get canControl(): boolean {
    return this.auth.isAuthenticated;
  }
  get isTracking(): boolean {
    return this.stateSvc.vehicleTrackingState.status;
  }
  get showToolName(): boolean {
    return this.settingSvc.globalPreferences.toggles.showToolName;
  }
  get tooltipOffset(): string {
    return this.showToolName ? '164px' : '36px';
  }

  private _searchDlg: MatDialogRef<SearchDialogComponent, any>;
  private _trackDlg: MatDialogRef<TrackVehicleDialogComponent, any>;
  private _cmdDlg: MatDialogRef<CommandDialogComponent, any>;
  private _showObjDlg: MatDialogRef<ShowObjectDialogComponent, any>;
  private _vhStatusDlg: MatDialogRef<VehicleStatusDialogComponent, any>;
  private _bfStatusDlg: MatDialogRef<BufferStatusDialogComponent, any>;

  constructor(
    private auth: AuthService,
    private stateSvc: MapStatesService,
    private messageSvc: MessagesService,
    private settingSvc: SettingsService,
    private dialogSvc: DialogService,
    private dialog: MatDialog,
    private $t: TranslateService
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._searchDlg &&
      this._searchDlg.getState() === MatDialogState.OPEN &&
      this._searchDlg.close();

    this._trackDlg &&
      this._trackDlg.getState() === MatDialogState.OPEN &&
      this._trackDlg.close();

    this._cmdDlg &&
      this._cmdDlg.getState() === MatDialogState.OPEN &&
      this._cmdDlg.close();

    this._showObjDlg &&
      this._showObjDlg.getState() === MatDialogState.OPEN &&
      this._showObjDlg.close();

    this._vhStatusDlg &&
      this._vhStatusDlg.getState() === MatDialogState.OPEN &&
      this._vhStatusDlg.close();

    this._bfStatusDlg &&
      this._bfStatusDlg.getState() === MatDialogState.OPEN &&
      this._bfStatusDlg.close();
  }

  hasPermission(permission: number): boolean {
    return AccountUtil.hasPermission(permission, this.auth.currentUser);
  }

  onSearch() {
    if (this._searchDlg && this._searchDlg.getState() === MatDialogState.OPEN) {
      this._searchDlg.close();
      return;
    }
    const rect: DOMRect = this.btnSearch.nativeElement.getBoundingClientRect();
    this._searchDlg = this.dialog.open(SearchDialogComponent, {
      width: '350px',
      hasBackdrop: false,
      disableClose: true,
      closeOnNavigation: true,
      position: { left: this.tooltipOffset, top: `${rect.top}px` },
    });

    this._searchDlg.afterClosed().subscribe((payload: any) => {
      if (!payload || !payload.type || !payload.value) return;
      this.stateSvc.commandToolbar('search', payload);
    });
  }

  onTrackVehicle() {
    if (this.isTracking) {
      this.stateSvc.commandToolbar('trackVehicle', null);
      return;
    }
    if (this._trackDlg && this._trackDlg.getState() === MatDialogState.OPEN) {
      this._trackDlg.close();
      return;
    }

    const rect: DOMRect = this.btnTrack.nativeElement.getBoundingClientRect();
    this._trackDlg = this.dialog.open(TrackVehicleDialogComponent, {
      width: '350px',
      autoFocus: false,
      hasBackdrop: false,
      disableClose: true,
      closeOnNavigation: true,
      position: { left: this.tooltipOffset, top: `${rect.top}px` },
    });

    this._trackDlg.afterClosed().subscribe((payload: any) => {
      if (!payload) return;
      this.stateSvc.commandToolbar('trackVehicle', payload);
    });
  }

  onManualCommand() {
    if (this._cmdDlg && this._cmdDlg.getState() === MatDialogState.OPEN) {
      this._cmdDlg.close();
      return;
    }

    const rect: DOMRect = this.btnCommand.nativeElement.getBoundingClientRect();
    this._cmdDlg = this.dialog.open(CommandDialogComponent, {
      width: '350px',
      autoFocus: false,
      hasBackdrop: false,
      disableClose: true,
      closeOnNavigation: true,
      position: { left: this.tooltipOffset, top: `${rect.top}px` },
    });

    this._cmdDlg.afterClosed().subscribe((payload: any) => {
      if (!payload) return;

      this.messageSvc.sendOrderCommand(payload).subscribe(() => {
        this.stateSvc.resetTransferCommandState();
      });
      // this.stateSvc.commandToolbar('manualOrder', payload);
    });
  }

  onTuneVisibility() {
    if (
      this._showObjDlg &&
      this._showObjDlg.getState() === MatDialogState.OPEN
    ) {
      this._showObjDlg.close();
      return;
    }

    const rect = this.btnShowObj.nativeElement.getBoundingClientRect();
    this._showObjDlg = this.dialog.open(ShowObjectDialogComponent, {
      width: '350px',
      autoFocus: false,
      hasBackdrop: false,
      disableClose: false,
      closeOnNavigation: true,
      position: { left: this.tooltipOffset, top: `${rect.top}px` },
      data: this.buttonState,
    });
  }

  onToggleTool(action: ToggleOptionKeyType) {
    const value = !this.buttonState[action];
    this.buttonState[action] = value;
    this.stateSvc.changeToolbarState(action, value);
  }

  onCommandTool(action: CommandKeyType) {
    this.stateSvc.commandToolbar(action);
  }

  onOpenVehicleStatus() {
    if (
      this._vhStatusDlg &&
      this._vhStatusDlg.getState() === MatDialogState.OPEN
    ) {
      this._vhStatusDlg.close();
      return;
    }

    this._vhStatusDlg = this.dialog.open(VehicleStatusDialogComponent, {
      width: '750px',
      autoFocus: false,
      hasBackdrop: false,
      disableClose: false,
      closeOnNavigation: true,
    });
  }

  onOpenBufferStatus() {
    if (
      this._bfStatusDlg &&
      this._bfStatusDlg.getState() === MatDialogState.OPEN
    ) {
      this._bfStatusDlg.close();
      return;
    }

    this._bfStatusDlg = this.dialog.open(BufferStatusDialogComponent, {
      width: '450px',
      autoFocus: false,
      hasBackdrop: false,
      disableClose: false,
      closeOnNavigation: true,
    });
  }

  // onPing() {
  //   this.messageSvc.sendVehicleCommand({ action: 'status' }).subscribe();
  // }
  // onVehicleReset() {
  //   this.dialogSvc
  //     .confirm({ body: this.$t.instant('messages.confirmResetAllVehicles') })
  //     .subscribe((confirm) => {
  //       if (confirm) {
  //         this.messageSvc.sendVehicleCommand({ action: 'reset' }).subscribe();
  //       }
  //     });
  // }
  // onSetAuto() {
  //   this.dialogSvc
  //     .confirm({ body: this.$t.instant('messages.confirmSetAutoAll') })
  //     .subscribe((confirm) => {
  //       if (confirm) {
  //         this.messageSvc
  //           .sendVehicleCommand({ action: 'initialize' })
  //           .subscribe();
  //       }
  //     });
  // }
  // onEStop() {
  //   this.dialogSvc
  //     .confirm({ body: this.$t.instant('messages.confirmEstopAll') })
  //     .subscribe((confirm) => {
  //       if (confirm) {
  //         this.messageSvc.sendVehicleCommand({ action: 'stop' }).subscribe();
  //       }
  //     });
  // }
}
