import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  mergeMap,
  switchMap,
} from 'rxjs/operators';
import { IOrderCommandMessage } from '../../../models/command.model';
import {
  ILookupUnit,
  TransferCommandCategoryType,
  TransferCommandState,
} from '../../../models/map.interface';
import { MessagesService } from '../../../services/messages.service';
import { MapDataService } from '../map-data.service';
import { MapStatesService } from '../map-states.service';

@Component({
  selector: 'oms-command-dialog',
  templateUrl: './command-dialog.component.html',
  styleUrls: ['./command-dialog.component.scss'],
})
export class CommandDialogComponent implements OnInit, OnDestroy {
  currentTab = 0;
  sourceOptions$: Observable<ILookupUnit[]>;
  destOptions$: Observable<ILookupUnit[]>;

  sourceControl = new FormControl();

  carrierId: string;

  vehicleList: [];
  pointList: [];
  portList: [];
  selectedVehicle: any;
  selectedPointId: any;
  selectedFrom: any;
  selectedTo: any;
  isAuto = false;

  tabs: TransferCommandCategoryType[] = ['move', 'fromTo', 'from', 'to'];

  get canApply(): boolean {
    return true;
  }
  get commandState(): TransferCommandState {
    return this.statesSvc.transferCommandState;
  }

  constructor(
    private statesSvc: MapStatesService,
    private dataSvc: MapDataService,
    private dialog: MatDialogRef<CommandDialogComponent>,
    private t$: TranslateService
  ) {}

  displayTargetFn(item: ILookupUnit): string | undefined {
    if (!item) return;
    return `${item.objectType} #${item.id}`;
  }

  ngOnDestroy(): void {
    this.statesSvc.transferCommandState.active = false;
  }

  ngOnInit(): void {
    this.statesSvc.transferCommandState.active = true;
    this.sourceOptions$ = this.buildDataSource(this.sourceControl);
  }

  onTabChanged() {
    this.statesSvc.transferCommandState.category = this.tabs[this.currentTab];
  }

  private buildDataSource(control: FormControl): Observable<ILookupUnit[]> {
    return control.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) =>
        this.dataSvc.lookupUnits(['points', 'stations', 'buffers'], value)
      ),
      mergeMap((list) => of(list))
    );
  }

  onAutoCompleteClear(control) {
    console.log('## onAutoCompleteClear >>', control);
  }
  onLocationSelected(location: ILookupUnit) {
    console.log('## onLocationSelected >>', location);
  }
  onApply() {
    const error = this.validate();
    if (error) {
      throw error;
    }

    const {
      auto,
      vehicle,
      vehicleDisabled,
      pointDisabled,
      point,
      sourceDisabled,
      source,
      dest,
      destDisabled,
      carrier,
    } = this.commandState;

    const cmd: IOrderCommandMessage = {
      type: 'ORDER',
      action: 'N',
      orderOrigin: 'OMS',
      priority: 1, // @TODO priority 기본값 확인
      vehicleId: vehicle.id,
      carrierLabel: carrier,
    };
    !pointDisabled && (cmd.locationMove = point.id.toString());
    !sourceDisabled && (cmd.locationPickup = source.id.toString());
    !destDisabled && (cmd.locationDropoff = dest.id.toString());

    this.dialog.close(cmd);
  }

  private validate(): undefined | string {
    const {
      auto,
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

    if (!pointDisabled && !point)
      return this.t$.instant('messages.required', { field: 'Point' });

    if (!sourceDisabled && !source)
      return this.t$.instant('messages.required', { field: 'Source' });

    if (!destDisabled && !dest)
      return this.t$.instant('messages.required', { field: 'Dest' });

    return;
  }
}
