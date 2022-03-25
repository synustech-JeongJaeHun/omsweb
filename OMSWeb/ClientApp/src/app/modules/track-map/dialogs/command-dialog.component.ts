import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '../../../services/dialog.service';
import { MessagesService } from '../../../services/messages.service';
import {
  IOrderCommandMessage,
  IVehicleCommandMessage,
} from '../../../models/command.model';
import {
  TransferCommandCategoryType,
  TransferCommandState,
} from '../../../models/map.interface';
import { MapStatesService } from '../map-states.service';

@Component({
  selector: 'oms-command-dialog',
  templateUrl: './command-dialog.component.html',
  styleUrls: ['./command-dialog.component.scss'],
})
export class CommandDialogComponent implements OnInit, OnDestroy {
  currentTab = 0;
  isAuto = true;

  tabs: TransferCommandCategoryType[] = ['fromTo', 'from', 'to', 'move', 'mtl'];

  get canApply(): boolean {
    return true;
  }
  get commandState(): TransferCommandState {
    return this.statesSvc.transferCommandState;
  }

  constructor(
    private statesSvc: MapStatesService,
    private dialog: MatDialogRef<CommandDialogComponent>,
    private dialogSvc: DialogService,
    private messageSvc: MessagesService,
    private t$: TranslateService
  ) {}

  ngOnDestroy(): void {
    this.statesSvc.transferCommandState.active = false;
  }

  ngOnInit(): void {
    this.statesSvc.transferCommandState.active = true;

    this.onTabChanged();
  }

  onTabChanged() {
    this.statesSvc.transferCommandState.category = this.tabs[this.currentTab];
  }

  onApply() {
    const error = this.validate();
    if (error) {
      throw error;
    }

    const {
      auto,
      category,
      vehicle,
      vehicleDisabled,
      pointDisabled,
      point,
      sourceDisabled,
      source,
      dest,
      destDisabled,
      carrier,
      mtl,
      mtlInOut,
    } = this.commandState;

    if (category === 'mtl') {
      const cmd: IVehicleCommandMessage = {
        action: mtlInOut ? 'mtl_in' : 'mtl_out',
        vehicleId: String(vehicle.id),
        mtlId: String(mtl.id),
      };

      this.dialogSvc
        .confirm({ body: this.t$.instant('messages.confirmCommand') })
        .subscribe((ok) => {
          if (ok) {
            this.messageSvc.sendVehicleCommand(cmd).subscribe();
          }
        });

      return;
    }

    const cmd: IOrderCommandMessage = {
      type: 'ORDER',
      action: 'N',
      orderOrigin: 'OMS',
      priority: 1, // @TODO priority 기본값 확인
      carrierLabel: carrier,
    };

    if (category == 'move') {
      if (!pointDisabled && point)
        !pointDisabled && (cmd.locationMoveType = point.objectType);
      else if (!destDisabled && dest)
        !destDisabled && (cmd.locationMoveType = dest.objectType);
    } else {
      !pointDisabled && (cmd.locationMoveType = point.objectType);
      !destDisabled && (cmd.locationDropoffType = dest.objectType);
    }
    !sourceDisabled && (cmd.locationPickupType = source.objectType);

    !vehicleDisabled && (cmd.vehicleId = vehicle.id);
    if (category == 'move') {
      if (!pointDisabled && point)
        !pointDisabled && (cmd.locationMove = point.id.toString());
      else if (!destDisabled && dest)
        !destDisabled && (cmd.locationMove = dest.id.toString());
    } else {
      !pointDisabled && (cmd.locationMove = point.id.toString());
      !destDisabled && (cmd.locationDropoff = dest.id.toString());
    }
    !sourceDisabled && (cmd.locationPickup = source.id.toString());

    //this.dialog.close(cmd);
    //this.messageSvc.sendOrderCommand(cmd).subscribe();

    this.dialogSvc
      .confirm({ body: this.t$.instant('messages.confirmCommand') })
      .subscribe((ok) => {
        if (ok) {
          this.messageSvc.sendOrderCommand(cmd).subscribe();
        }
      });
  }

  private validate(): undefined | string {
    const {
      auto,
      category,
      vehicle,
      vehicleDisabled,
      pointDisabled,
      point,
      sourceDisabled,
      source,
      dest,
      destDisabled,
    } = this.commandState;

    if (!vehicleDisabled && !vehicle)
      return this.t$.instant('messages.required', { field: 'Vehicle' });

    if (!pointDisabled && !point) {
      if (category == 'move') {
        if (!destDisabled && !dest)
          return this.t$.instant('messages.required', { field: 'Point' });
      } else return this.t$.instant('messages.required', { field: 'Point' });
    }

    if (!sourceDisabled && !source)
      return this.t$.instant('messages.required', { field: 'Source' });

    if (!destDisabled && !dest) {
      if (category == 'move') {
        if (!pointDisabled && !point)
          return this.t$.instant('messages.required', { field: 'Dest' });
      } else return this.t$.instant('messages.required', { field: 'Dest' });
    }

    return;
  }
}
