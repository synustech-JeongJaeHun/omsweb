import {Component} from '@angular/core';
import {IKeyValuePair} from '@oms/models/base.model';
import {MatDialogRef} from '@angular/material/dialog';
import {TrackStatusService} from '@oms/root/services/track-status.service';
import {SettingsService} from "@oms/services/settings.service";
import {PointType} from "../../../models/enums"

type Ids = { id: number, logicalId: string }
type ObjectTypeKey = "point" | "segment" | "station" | "mtl" | "buffer" | "zcu" | "cluster" | "vehicle"

@Component({
  selector: 'oms-search-dialog',
  templateUrl: './search-dialog.component.html',
  styles: [
    `
      .form-item {
        margin-bottom: 4px;
      }
    `,
  ],
})
export class SearchDialogComponent {
  objectTypes = [
    { key: 'vehicle', value: 'Vehicle' },
    { key: 'point', value: 'Point' },
    { key: 'segment', value: 'Segment' },
    { key: 'station', value: 'Station' },
    { key: 'buffer', value: 'Buffer' },
    { key: 'mtl', value: 'MTL' },
    { key: 'zcu', value: 'ZCU' },
    { key: 'cluster', value: 'Cluster' },
  ];

  selectedType: IKeyValuePair<string, string>;
  targets: Ids[];

  selectedId: number;

  private dataSourceMap: Record<ObjectTypeKey, Ids[]>;

  canSelectTarget(type: ObjectTypeKey, logicalId: string): boolean {
    return this.dataSourceMap[type]?.find(o => o.logicalId === logicalId)
      ? true
      : false
  }

  constructor(
    private trackStatusService: TrackStatusService,
    private dialog: MatDialogRef<SearchDialogComponent>,
    private settingSvc: SettingsService
  ) {
    this.onLoad()
  }

  onSearch(type: string, value: string) {
    const { id } = this.dataSourceMap[type].find(e => e.logicalId === value)
    this.dialog.close({ type, id });
  }

  onSelectType(item: IKeyValuePair<string, string>) {
    if (!item) return;
    this.selectedType = item;
    this.targets = this.dataSourceMap[item.key];
  }

  onLoad(){
    const pointDisplayType = this.settingSvc.globalPreferences.trackDisplay.pointDisplay
    let points = null

    if(pointDisplayType===PointType.BCR)
      points = this.trackStatusService.trackData.points.map((x) => ({id: x.id, logicalId: x.physicalId}))
    else if(pointDisplayType===PointType.ID_BCR)
      points = this.trackStatusService.trackData.points.map((x) => ({id: x.id, logicalId: `${x.logicalId}(${x.physicalId})`}))
    else
      points = this.trackStatusService.trackData.points.map((x) => ({id: x.id, logicalId: x.logicalId}))

    let stations = [...this.trackStatusService.trackData.stations.map((x) => ({ id: x.id, logicalId: x.logicalId })),
      ...this.trackStatusService.trackData.stations.map((x) => ({ id: x.id, logicalId: String(x.id) })),
      ...this.trackStatusService.trackData.stations.map((x) => ({ id: x.id, logicalId: x.physicalId }))]



    this.dataSourceMap = {
      vehicle: this.trackStatusService.trackData.vehicles.map((x) => ({id: x.id, logicalId: x.logicalId})),
      point: points,
      // distinct element because segment data is mixed with segparts
      segment: [...new Map(this.trackStatusService.trackData.segments.map((x) => [x.id, x.logicalId]))].map((x) => ({ id: x[0], logicalId: x[1] })),
      station: stations,
      buffer: this.trackStatusService.trackData.buffers.map((x) => ({ id: x.id, logicalId: x.logicalId })),
      mtl: this.trackStatusService.trackData.mtls.map((x) => ({ id: x.id, logicalId: x.logicalId })),
      zcu: this.trackStatusService.trackData.zcus.map((x) => ({ id: x.id, logicalId: String(x.id) })),
      cluster: this.trackStatusService.trackData.clusters.map((x) => ({id: x.id, logicalId: String(x.id)})),
    };

    this.selectedType = this.objectTypes[0]
    this.targets = this.dataSourceMap.vehicle
  }
}
