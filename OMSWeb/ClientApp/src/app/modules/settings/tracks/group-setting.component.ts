import { Component, OnInit } from '@angular/core';

import { TracksService } from '@oms/services/tracks.service';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IIdObject } from '../../../models/base.model';
import { Dto } from '../../../models/dto/track.model';
import { TrackIdService } from '../../../services/track-id.service';
@Component({
  selector: 'oms-group-setting',
  templateUrl: './group-setting.component.html',
  styleUrls: ['./group-setting.component.scss'],
})
export class GroupSettingComponent implements OnInit {
  ready = false;
  selectedItem: Dto.IGroup;
  groupIds: number[] = [];

  assignedPoints: number[] = [];
  assignedStations: number[] = [];
  assignedVehicles: number[] = [];
  assignedBuffers: number[] = [];

  points: number[] = [];
  stations: number[] = [];
  vehicles: number[] = [];
  buffers: number[] = [];

  private _changed: Dto.IGroup[] = [];
  private _groups: Dto.IGroup[] = [];

  constructor(private trackSvc: TracksService, private idSvc: TrackIdService) {
    this.init();
  }

  ngOnInit(): void {}

  onChange(type: string, picked: number[]) {
    const { objects } = this.selectedItem;
    this.selectedItem.objects = [
      ...objects.filter((x) => x.type !== type),
      ...picked.map((id) => ({ id, type })),
    ];

    if (this._changed.every((x) => x.id !== this.selectedItem.id)) {
      this._changed.push(this.selectedItem);
    }
  }

  onSave() {
    if (!this._changed.length) return;
    forkJoin(this._changed.map(x => this.trackSvc.updateGroup(x.id, x))).subscribe(() => {
      this.onRevert();
    });
  }
  onRevert() {
    this._changed = [];
    this.assignedPoints = [];
    this.assignedBuffers = [];
    this.assignedStations = [];
    this.assignedVehicles = [];
    this.init();
  }

  private init() {
    forkJoin([this.loadGroups(), this.loadIds()]).subscribe(() => {
      if (this._groups.length) {
        this.selectedItem = this._groups[0];
        this.groupIds = this._groups.map((x) => x.id);
        this.bindData();
      }
      this.ready = true;
    });
  }

  private bindData() {
    this.assignedPoints = this.selectedItem.objects
      .filter(
        (x: string | Dto.IGroupedObject) =>
          typeof x !== 'string' && x.type === 'points'
      )
      .map((x) => x.id);

    this.assignedStations = this.selectedItem.objects
      .filter(
        (x: string | Dto.IGroupedObject) =>
          typeof x !== 'string' && x.type === 'stations'
      )
      .map((x) => x.id);

    this.assignedVehicles = this.selectedItem.objects
      .filter(
        (x: string | Dto.IGroupedObject) =>
          typeof x !== 'string' && x.type === 'vehicles'
      )
      .map((x) => x.id);

    this.assignedBuffers = this.selectedItem.objects
      .filter(
        (x: string | Dto.IGroupedObject) =>
          typeof x !== 'string' && x.type === 'buffers'
      )
      .map((x) => x.id);
  }

  private loadGroups() {
    return this.trackSvc.loadGroups().pipe(
      tap((groups) => {
        this._groups = groups;
      })
    );
  }
  private loadIds() {
    return this.idSvc.loadIds().pipe(
      tap(() => {
        this.points = Object.values(this.idSvc.points).map((x) => x.id);
        this.stations = Object.values(this.idSvc.stations).map((x) => x.id);
        this.vehicles = Object.values(this.idSvc.vehicles).map((x) => x.id);
        this.buffers = Object.values(this.idSvc.buffers).map((x) => x.id);
      })
    );
  }
}
