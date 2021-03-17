import { Component, OnInit } from '@angular/core';
import DataSource from 'devextreme/data/data_source';

import { IKeyValuePair } from '@oms/models/base.model';
import { MapDataService } from '../map-data.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'oms-search-dialog',
  templateUrl: './search-dialog.component.html',
  styles: [
    `
      .form-item {
        margin-bottom: 8px;
      }
    `,
  ],
})
export class SearchDialogComponent implements OnInit {
  objectTypes: IKeyValuePair<string, string>[] = [];
  targets: number[];

  selectedType: string;
  selectedId: number;

  private dataSourceMap: { [key: string]: number[] };

  get canSelectTarget(): boolean {
    return !!this.selectedType && this.targets.length > 0;
  }

  constructor(
    private dataSvc: MapDataService,
    private dialog: MatDialogRef<SearchDialogComponent>
  ) {
    this.objectTypes = [
      // { key: 'vehicle', value: 'Vehicle' },
      { key: 'point', value: 'Point' },
      { key: 'segment', value: 'Segment' },
      { key: 'station', value: 'Station' },
      { key: 'buffer', value: 'Buffer' },
      { key: 'mtl', value: 'MTL' },
      // { key: 'cluster', value: 'Cluster' },
    ];
  }

  ngOnInit(): void {
    this.initDataSource();
  }

  onSearch(type: string, value: string) {
    this.dialog.close({ type, value });
  }

  private initDataSource() {
    this.dataSourceMap = {
      // vehicle: this.dataSvc.data.vehicles.map((x) => x.id),
      point: this.dataSvc.data.points.map((x) => x.id),
      buffer: this.dataSvc.data.buffers.map((x) => x.id),
      station: this.dataSvc.data.stations.map((x) => x.id),
      mtl: this.dataSvc.data.mtls.map((x) => x.id),
      // cluster: this.dataSvc.data.clusters.map((x) => x.id),
      segment: this.dataSvc.data.segments.map((x) => x.id),
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
