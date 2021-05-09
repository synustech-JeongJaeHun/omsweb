import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Dto } from '../../../models/dto/track.model';
import { TrackIdService } from '../../../services/track-id.service';
import { TracksService } from '../../../services/tracks.service';

@Component({
  selector: 'oms-cluster-setting',
  templateUrl: './cluster-setting.component.html',
  styleUrls: ['./cluster-setting.component.scss'],
})
export class ClusterSettingComponent implements OnInit {
  selectedItem: Dto.ICluster;
  clusters: Dto.ICluster[] = [];

  points: number[] = [];
  assignedPoints: number[] = [];

  private _changed: Dto.ICluster[] = [];

  get canSave(): boolean {
    return this.clusters.length > 0 && this._changed.length > 0;
  }

  constructor(private trackSvc: TracksService, private idSvc: TrackIdService) {
    this.init();
  }

  ngOnInit(): void {}

  onAssignChanged(picked: number[]) {
    this.selectedItem.points = picked.join(',');
    this.changeItem(this.selectedItem);
  }
  onMaxVehiclesChanged(value: number) {
    this.selectedItem.maxVehicles = value;
    this.changeItem(this.selectedItem);
  }

  onSave() {
    if (!this._changed.length) return;
    console.log('## changed >>', this._changed);
    forkJoin(
      this._changed.map((x) => this.trackSvc.updateCluster(x.id, x))
    ).subscribe(() => {
      this.onRevert();
    });
  }
  onRevert() {
    this._changed = [];
    this.init();
  }

  private init() {
    forkJoin([this.loadClusters(), this.loadIds()]).subscribe(() => {
      if (this.clusters.length) {
        this.selectedItem = this.clusters[0];
        this.bindData();
      }
    });
  }

  private changeItem(item: Dto.ICluster) {
    if (this._changed.every((x) => x.id !== item.id)) {
      this._changed.push(item);
    }
  }

  private bindData() {
    const strPoints = this.selectedItem.points;
    if (strPoints) {
      this.assignedPoints = strPoints
        .split(',')
        .map((s) => Number(s).valueOf());
    }
  }

  private loadClusters() {
    return this.trackSvc.loadClusters().pipe(
      tap((clusters) => {
        this.clusters = clusters;
      })
    );
  }
  private loadIds() {
    return this.idSvc.loadIds().pipe(
      tap(() => {
        this.points = Object.values(this.idSvc.points).map((x) => x.id);
      })
    );
  }
}
