import { Component } from '@angular/core';

import { IKeyValuePair } from '@oms/models/base.model';
import { MatDialogRef } from '@angular/material/dialog';
import { TrackStatusService } from '@oms/root/services/track-status.service';

type Ids = { id: number, logicalId: string }
type ObjectTypeKey = "point" | "segment" | "station" | "mtl" | "buffer"

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
    { key: 'point', value: 'Point' },
    { key: 'segment', value: 'Segment' },
    { key: 'station', value: 'Station' },
    { key: 'buffer', value: 'Buffer' },
    { key: 'mtl', value: 'MTL' },
  ];
  targets: number[];

  selectedType: string;
  selectedId: number;

  private dataSourceMap: Record<ObjectTypeKey, Ids[]>;

  canSelectTarget(type: ObjectTypeKey, logicalId: string): boolean {
    return this.dataSourceMap[type]?.find(o => o.logicalId === logicalId)
      ? true
      : false
  }

  constructor(
    private trackStatusService: TrackStatusService,
    private dialog: MatDialogRef<SearchDialogComponent>
  ) {
    this.dataSourceMap = {
      point: this.trackStatusService.trackData.points.map((x) => ({ id: x.id, logicalId: x.logicalId })),
      buffer: this.trackStatusService.trackData.buffers.map((x) => ({ id: x.id, logicalId: x.logicalId })),
      station: this.trackStatusService.trackData.stations.map((x) => ({ id: x.id, logicalId: x.logicalId })),
      mtl: this.trackStatusService.trackData.mtls.map((x) => ({ id: x.id, logicalId: x.logicalId })),
      // distinct element because segment data is mixed with segparts
      segment: [...new Map(this.trackStatusService.trackData.segments.map((x) => [x.id, x.logicalId]))].map((x) => ({ id: x[0], logicalId: x[1] }))
    };
  }

  onSearch(type: string, value: string) {
    const { id } = this.dataSourceMap[type].find(e => e.logicalId === value)
    this.dialog.close({ type, id });
  }

  onSelectType(item: IKeyValuePair<string, string>) {
    if (!item) return;
    this.selectedType = item.key;
    this.targets = this.dataSourceMap[item.key];
  }
}
