import { Component, OnInit } from '@angular/core';

import { IKeyValuePair } from '@oms/models/base.model';
import { MapDataService } from '../map-data.service';
import { MatDialogRef } from '@angular/material/dialog';

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
export class SearchDialogComponent implements OnInit {
  objectTypes = [
    // { key: 'vehicle', value: 'Vehicle' },
    { key: 'point', value: 'Point' },
    { key: 'segment', value: 'Segment' },
    { key: 'station', value: 'Station' },
    { key: 'buffer', value: 'Buffer' },
    { key: 'mtl', value: 'MTL' },
    // { key: 'cluster', value: 'Cluster' },
  ];
  targets: number[];

  selectedType: string;
  selectedId: number;

  private dataSourceMap: Record<ObjectTypeKey, Ids[]>;

  get canSelectTarget(): boolean {
    return !!this.selectedType && this.targets.length > 0;
  }

  constructor(
    private dataSvc: MapDataService,
    private dialog: MatDialogRef<SearchDialogComponent>
  ) { }

  ngOnInit(): void {
    this.initDataSource();
  }

  onSearch(type: string, value: string) {
    const { id } = this.dataSourceMap[type].find(e => e.logicalId === value)
    this.dialog.close({ type, value: id });
  }

  private initDataSource() {
    this.dataSourceMap = {
      // vehicle: this.dataSvc.data.vehicles.map((x) => x.id),
      point: this.dataSvc.data.points.map((x) => ({ id: x.id, logicalId: x.logicalId })),
      buffer: this.dataSvc.data.buffers.map((x) => ({ id: x.id, logicalId: x.logicalId })),
      station: this.dataSvc.data.stations.map((x) => ({ id: x.id, logicalId: x.logicalId })),
      mtl: this.dataSvc.data.mtls.map((x) => ({ id: x.id, logicalId: x.logicalId })),
      // cluster: this.dataSvc.data.clusters.map((x) => {id: x.id,  logicalId: x.logicalId}),
      segment: this.dataSvc.data.segments.map((x) => ({ id: x.id, logicalId: x.logicalId })),
    };
  }

  onSelectType(item: IKeyValuePair<string, string>) {
    if (!item) return;
    this.selectedType = item.key;
    this.targets = this.getSelectionTargets(item.key);
  }

  private getSelectionTargets(selectedType: string): number[] {
    return this.dataSourceMap[selectedType];
  }
}
