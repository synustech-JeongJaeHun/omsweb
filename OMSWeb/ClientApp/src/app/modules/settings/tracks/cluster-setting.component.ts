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
  clusterIds: number[] = [];

  points: number[] = [];
  assignedPoints: number[] = [];

  private _changed: Dto.ICluster[] = [];
  private _clusters: Dto.ICluster[] = [];

  constructor(private trackSvc: TracksService, private idSvc: TrackIdService) {
    this.init();
  }

  ngOnInit(): void {}

  private init() {
    forkJoin([this.loadClusters(), this.loadIds()]).subscribe(() => {
      if (this._clusters.length) {
        this.selectedItem = this._clusters[0];
        this.clusterIds = this._clusters.map((x) => x.id);
        this.bindData();
      }
    });
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
        this._clusters = clusters;
        console.log('## clusters >>', clusters);
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
