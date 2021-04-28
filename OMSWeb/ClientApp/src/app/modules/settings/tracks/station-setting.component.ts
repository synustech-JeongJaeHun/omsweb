import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'oms-station-setting',
  templateUrl: './station-setting.component.html',
  styleUrls: ['./station-setting.component.scss'],
})
export class StationSettingComponent implements OnInit {
  dataSource: any[] = [];

  constructor() {
    this.dataSource = [
      {
        id: 1,
        onlineName: 'station-1',
        maxRetrySec: 60,
        retryIntervalSec: 5,
        unuse: false,
      },
      {
        id: 2,
        onlineName: 'station-2',
        maxRetrySec: 60,
        retryIntervalSec: 5,
        unuse: true,
      },
      {
        id: 3,
        onlineName: 'station-3',
        maxRetrySec: 60,
        retryIntervalSec: 5,
        unuse: false,
      },
    ];
  }

  ngOnInit(): void {}

  onUpdateRow(event) {}
}
