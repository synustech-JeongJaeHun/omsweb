import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TracksService } from '../../../services/tracks.service';

@Component({
  selector: 'oms-segment-setting',
  templateUrl: './segment-setting.component.html',
  styleUrls: ['./segment-setting.component.scss'],
})
export class SegmentSettingComponent implements OnInit {
  dataSource$: Observable<any[]>;

  constructor(private trackSvc: TracksService) {
    // this.dataSource$ = of([
    //   {
    //     id: 1,
    //     speed: 100,
    //     speedRatio: 100,
    //     length: 1235,
    //     obsLow: 12,
    //     obsHigh: 34,
    //     unuse: true,
    //     startPoint: 1,
    //     endPoint: 3,
    //   },
    //   {
    //     id: 2,
    //     speed: 100,
    //     speedRatio: 100,
    //     length: 1235,
    //     obsLow: 12,
    //     obsHigh: 34,
    //     unuse: true,
    //     startPoint: 1,
    //     endPoint: 3,
    //   },
    // ]);
    this.dataSource$ = this.trackSvc.loadSegments();
  }

  ngOnInit(): void {
    this.init();
  }

  onUpdateRow(event) {}

  customSpeedRatio(cellInfo) {
    return cellInfo.value + ' %';
  }

  private init() {}
}
