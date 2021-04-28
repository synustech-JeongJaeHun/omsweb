import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'oms-zcu-setting',
  templateUrl: './zcu-setting.component.html',
  styleUrls: ['./zcu-setting.component.scss'],
})
export class ZcuSettingComponent implements OnInit {
  dataSource: any[] = [];
  usingTypes = [
    { type: 0, text: 'Not Use' },
    { type: 1, text: 'Use HW' },
    { type: 2, text: 'Use SW' },
  ];

  zcuInfos = [
    { priority: 32, zone: [93,92,91,90] },
    { priority: 42, zone: [93,91,90,100] },
  ];

  constructor() {
    this.dataSource = ([
      {
        id: 1,
        type: 1,
        completeNodes: 23.32,
        usingType: 1,
      },
      {
        id: 2,
        type: 1,
        completeNodes: 23.32,
        usingType: 0,
      },
      {
        id: 3,
        type: 1,
        completeNodes: 23.32,
        usingType: 2,
      },
    ]);
  }

  ngOnInit(): void {}

  onUpdateRow(event) {}

  getInputZones(value) {
    return this.zcuInfos;
  }
}
