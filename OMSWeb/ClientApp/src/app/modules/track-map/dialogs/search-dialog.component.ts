import { Component, OnInit } from '@angular/core';

import { IKeyValuePair } from '@oms/models/base.model';

@Component({
  selector: 'oms-search-dialog',
  templateUrl: './search-dialog.component.html',
  styles: [
    `
    .form-item {
      margin-bottom: 8px;
    }
    `
  ],
})
export class SearchDialogComponent implements OnInit {
  objectTypes: IKeyValuePair<string>[] = [];
  targets: IKeyValuePair<number>[] = [];

  selectedType: string;
  selectedId: number;

  get canSelectTarget(): boolean {
    return !!this.selectedType && this.targets.length > 0;
  }

  constructor() {
    this.objectTypes = [
      { key: 'vehicle', value: 'Vehicle' },
      { key: 'segment', value: 'Segment' },
      { key: 'buffer', value: 'Buffer' },
    ];
  }

  ngOnInit(): void {}

  onSelectType(item: IKeyValuePair<string>) {
    if (!item) return;
    this.selectedType = item.key;
  }
}
