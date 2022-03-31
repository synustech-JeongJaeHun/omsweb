import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  defaultToggleOptions,
  ToggleOptionsType,
} from '@oms/models/settings.model';
import { CommandKeyType, ToggleOptionKeyType } from '../../../models/enums';

import { MapStatesService } from '../map-states.service';
import { MessagesService } from '@oms/services/messages.service';
import { DialogService } from '@oms/services/dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { VehicleStatusDialogComponent } from '../dialogs/vehicle-status-dialog.component';
import {
  MatDialog,
  MatDialogRef,
  MatDialogState,
} from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';
import { AccountUtil } from '../../shared/utils/account.util';
import { SettingsService } from '../../../services/settings.service';
import { PermissionEnums } from '../../../models/enums';
import { LegacySearchDialogComponent } from '../dialogs/legacy-search-dialog.component';
import { LegacyTrackVehicleDialogComponent } from '../dialogs/legacy-track-vehicle-dialog.component';
import { LegacyShowObjectDialogComponent } from '../dialogs/legacy-show-object-dialog.component';

@Component({
  selector: 'oms-legacy-map-toolbar',
  templateUrl: './legacy-map-toolbar.component.html',
  styleUrls: ['legacy-map-toolbar.component.scss'],
})
export class LegacyMapToolbarComponent implements OnInit, OnDestroy {
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

  private _searchDlg: MatDialogRef<LegacySearchDialogComponent, any>;
  private _trackDlg: MatDialogRef<LegacyTrackVehicleDialogComponent, any>;
  private _showObjDlg: MatDialogRef<LegacyShowObjectDialogComponent, any>;
  private _vhStatusDlg: MatDialogRef<VehicleStatusDialogComponent, any>;

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

    this._showObjDlg &&
      this._showObjDlg.getState() === MatDialogState.OPEN &&
      this._showObjDlg.close();

    this._vhStatusDlg &&
      this._vhStatusDlg.getState() === MatDialogState.OPEN &&
      this._vhStatusDlg.close();
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
    this._searchDlg = this.dialog.open(LegacySearchDialogComponent, {
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
    this._trackDlg = this.dialog.open(LegacyTrackVehicleDialogComponent, {
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

  onTuneVisibility() {
    if (
      this._showObjDlg &&
      this._showObjDlg.getState() === MatDialogState.OPEN
    ) {
      this._showObjDlg.close();
      return;
    }

    const rect = this.btnShowObj.nativeElement.getBoundingClientRect();
    this._showObjDlg = this.dialog.open(LegacyShowObjectDialogComponent, {
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
      height: '540px',
      autoFocus: false,
      hasBackdrop: false,
      disableClose: false,
      closeOnNavigation: true,
    });
  }
}
