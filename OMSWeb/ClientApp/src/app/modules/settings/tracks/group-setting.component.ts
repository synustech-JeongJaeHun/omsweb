import { Component, OnInit } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import _ = require('lodash');
import { tap } from 'rxjs/operators';
import { ISettingsGroup, ISettingsGroupedObject } from '../../../models/settings.model';
import { SettingsService } from '../../../services/settings.service';
import { MessagesService } from '../../../services/messages.service';

@Component({
  selector: 'oms-group-setting',
  templateUrl: './group-setting.component.html',
  styleUrls: ['./group-setting.component.scss'],
})
export class GroupSettingComponent implements OnInit {
  ready = false;

  groups: ISettingsGroup[] = [];
  groupedObjects: ISettingsGroupedObject[] = [];

  selectedItem: ISettingsGroup;

  assignedHomePoints: number[] = [];
  assignedStations: number[] = [];
  assignedVehicles: number[] = [];
  assignedBuffers: number[] = [];

  homePoints: number[] = [];
  stations: number[] = [];
  vehicles: number[] = [];
  buffers: number[] = [];

  private _changedItems: ISettingsGroup[] = [];
  private _changedVehicleItems: number[] = [];


  get noData(): boolean {
    return this.ready && this.groups.length === 0;
  }

  get isUpdated(): boolean {
    return this.ready && this.groups.length > 0 && this._changedItems.length > 0;
  }

  constructor(
    private settingsSvc: SettingsService,
    private messageSvc: MessagesService
  ) {
    this.init();
  }

  private init() {
    forkJoin([this.loadGroups(), this.loadGroupedObjects()]).subscribe(() => {
      if (this.groups.length) {
        this.selectedItem = this.groups[0];
        forkJoin([this.bindGroupData(this.selectedItem.id)]);
      }
      this.ready = true;
    });
  }

  private loadGroups() {
    return this.settingsSvc.settingsGroups().pipe(
      tap((res) => {
        this.groups = res;
      })
    );
  }
  private loadGroupedObjects() {
    return this.settingsSvc.settingsGroupedObjects().pipe(
      tap((res) => {
        this.groupedObjects = res;
      })
    );
  }

  private bindGroupData(groupId: number) {
    this.settingsSvc.settingsGroupIsAvailableHomePoints(groupId).subscribe((res) => {
      this.homePoints = res;
    });
    this.settingsSvc.settingsGroupIsAvailableStations(groupId).subscribe((res) => {
      this.stations = res;
    });
    this.settingsSvc.settingsGroupIsAvailableVehicles(groupId).subscribe((res) => {
      this.vehicles = res;
    });
    this.settingsSvc.settingsGroupIsAvailableBuffers(groupId).subscribe((res) => {
      this.buffers = res;
    });

    this.assignedHomePoints = this.groupedObjects.filter(
      (x: ISettingsGroupedObject) => x.groupId === groupId && x.referenceTable === 'home'
    ).map((x) => x.referenceId);
    this.assignedStations = this.groupedObjects.filter(
      (x: ISettingsGroupedObject) => x.groupId === groupId && x.referenceTable === 'station'
    ).map((x) => x.referenceId);
    this.assignedVehicles = this.groupedObjects.filter(
      (x: ISettingsGroupedObject) => x.groupId === groupId && x.referenceTable === 'vehicle'
    ).map((x) => x.referenceId);
    this.assignedBuffers = this.groupedObjects.filter(
      (x: ISettingsGroupedObject) => x.groupId === groupId && x.referenceTable === 'buffer'
    ).map((x) => x.referenceId);
  }

  onGroupChanged() {
    this.bindGroupData(this.selectedItem.id);
  }

  ngOnInit(): void { }

  onChange(type: string, picked: number[]) {

    const { objects } = this.selectedItem;

    let pushedItem = {} as ISettingsGroup;
    pushedItem.id = this.selectedItem.id;
    pushedItem.objects = new Array(0);

    let items = picked;

    if (this._changedItems.every((x) => x.id !== this.selectedItem.id)) {
      for (let idx = 0; idx < items.length; idx++) {
        pushedItem.objects.push(items[idx]);
      }
      this._changedItems.push(pushedItem);
    } else {
      this._changedItems.find((x) => x.id === this.selectedItem.id).objects = new Array(0);

      for (let idx = 0; idx < items.length; idx++) {
        this._changedItems.find((x) => x.id === this.selectedItem.id).objects.push(items[idx]);
      }
    }
  }

  onSave() {
    if (!this._changedItems.length) return;

    this.SaveMessages(this._changedItems);
    this._changedItems = [];
    this._changedVehicleItems = [];
    this.bindGroupData(this.selectedItem.id);
  }

  onRevert() {
    this._changedItems = [];
    this._changedVehicleItems = [];

    this.homePoints = [];
    this.stations = [];
    this.vehicles = [];
    this.buffers = [];

    this.assignedHomePoints = [];
    this.assignedStations = [];
    this.assignedVehicles = [];
    this.assignedBuffers = [];

    this.init();
  }

  SaveMessages(items: ISettingsGroup[]): Observable<void> {
    for (let idx = 0; idx < items.length; idx++) {
      let currentAssignedVehicles = this.groupedObjects.filter(
        (x: ISettingsGroupedObject) => x.groupId === items[idx].id && x.referenceTable === 'vehicle'
      ).map((x) => x.referenceId);

      let addedVehicles = [];
      addedVehicles = _.difference(items[idx].objects, currentAssignedVehicles);

      let removedVehicles = [];
      removedVehicles = _.difference(currentAssignedVehicles, items[idx].objects);

      // 그룹별 Vehicle 일괄 추가
      this.messageSvc
        .sendAssignVehicleGruopCommand({ type: 'GROUP', action: 'assign-vehicles', vehicleIds: addedVehicles })
        .subscribe();
      // 그룹별 Vehicle 개별 추가
      for (let idy = 0; idy < addedVehicles.length; idy++) {
        this.messageSvc
          .sendAssignVehicleGruopCommand({ type: 'GROUP', action: 'assign-vehicle', vehicleId: addedVehicles[idy] })
          .subscribe();
      }

      // 그룹별 Vehicle 일괄 삭제
      this.messageSvc
        .sendAssignVehicleGruopCommand({ type: 'GROUP', action: 'unassign-vehicles', vehicleIds: removedVehicles })
        .subscribe();
      // 그룹별 Vehicle 개별 삭제
      for (let idy = 0; idy < removedVehicles.length; idy++) {
        this.messageSvc
          .sendAssignVehicleGruopCommand({ type: 'GROUP', action: 'unassign-vehicle', vehicleId: removedVehicles[idy] })
          .subscribe();
      }
    }

    return;
  }
}
