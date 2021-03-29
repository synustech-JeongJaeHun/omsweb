import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
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
import { SearchDialogComponent } from '../dialogs/search-dialog.component';
import {
  MatDialog,
  MatDialogRef,
  MatDialogState,
} from '@angular/material/dialog';
import { TrackVehicleDialogComponent } from '../dialogs/track-vehicle-dialog.component';
import { CommandDialogComponent } from '../dialogs/command-dialog.component';
import { ShowObjectDialogComponent } from '../dialogs/show-object-dialog.component';

@Component({
  selector: 'oms-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['map-toolbar.component.scss'],
})
export class MapToolbarComponent implements OnInit {
  @Input()
  buttonState: ToggleOptionsType = defaultToggleOptions;

  @ViewChild('btnSearch', { read: ElementRef }) btnSearch: ElementRef;
  @ViewChild('btnTrack', { read: ElementRef }) btnTrack: ElementRef;
  @ViewChild('btnCommand', { read: ElementRef }) btnCommand: ElementRef;
  @ViewChild('btnShowObj', { read: ElementRef }) btnShowObj: ElementRef;

  visibilityOpen = false;

  private _searchDlg: MatDialogRef<SearchDialogComponent, any>;
  private _trackDlg: MatDialogRef<TrackVehicleDialogComponent, any>;
  private _cmdDlg: MatDialogRef<CommandDialogComponent, any>;
  private _showObjDlg: MatDialogRef<ShowObjectDialogComponent, any>;

  constructor(
    private stateSvc: MapStatesService,
    private messageSvc: MessagesService,
    private dialogSvc: DialogService,
    private dialog: MatDialog,
    private $t: TranslateService
  ) {}

  ngOnInit(): void {}

  onSearch() {
    if (this._searchDlg && this._searchDlg.getState() === MatDialogState.OPEN) {
      this._searchDlg.close();
      return;
    }
    const rect: DOMRect = this.btnSearch.nativeElement.getBoundingClientRect();
    this._searchDlg = this.dialog.open(SearchDialogComponent, {
      width: '300px',
      hasBackdrop: false,
      disableClose: true,
      closeOnNavigation: true,
      position: { left: '36px', top: `${rect.top}px` },
    });

    this._searchDlg.afterClosed().subscribe((payload: any) => {
      if (!payload || !payload.type || !payload.value) return;
      this.stateSvc.commandToolbar('search', payload);
    });
  }

  onTrackVehicle() {
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
      position: { left: '36px', top: `${rect.top}px` },
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
      position: { left: '36px', top: `${rect.top}px` },
    });

    this._cmdDlg.afterClosed().subscribe((payload: any) => {
      if (!payload) return;
      this.stateSvc.commandToolbar('manualOrder', payload);
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
      width: '400px',
      autoFocus: false,
      hasBackdrop: false,
      disableClose: false,
      closeOnNavigation: true,
      position: { left: '36px', top: `${rect.top}px` },
      data: this.buttonState
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

  onPing() {
    this.messageSvc.sendPing().subscribe();
  }
  onVehicleReset() {
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmResetAllVehicles') })
      .subscribe((confirm) => {
        if (confirm) {
          this.messageSvc.sendVehicleReset().subscribe();
        }
      });
  }
  onSetAuto() {
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmSetAutoAll') })
      .subscribe((confirm) => {
        if (confirm) {
          this.messageSvc.sendSetAuto().subscribe();
        }
      });
  }
  onEStop() {
    this.dialogSvc
      .confirm({ body: this.$t.instant('messages.confirmEstopAll') })
      .subscribe((confirm) => {
        if (confirm) {
          this.messageSvc.sendEStop().subscribe();
        }
      });
  }
}
