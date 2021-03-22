import { Component, OnInit } from '@angular/core';
import { IPaginatedResult } from '../../../models/base.model';
import { IAlarmHistoryRow } from '../../../models/history.model';
import { HistoriesService } from '../../../services/histories.service';

@Component({
  selector: 'oms-alarm-history',
  templateUrl: './alarm-history.component.html',
  styles: [
    `
      #alarm-history-page {
        background-color: var(--dialog-border-color);
        display: grid;
        grid-template-rows: auto auto;
        left: 0;
        right: 0;
        bottom: 0;
        top: 44px;
      }

      #alarm-filter-area {
        margin: 10px;
        display: grid;
        grid-template-columns: 150px 150px 220px 220px 200px 120px;
        gap: 5px;
      }

      #alarm-result-area {
        padding: 10px;
      }
    `,
  ],
})
export class AlarmHistoryComponent implements OnInit {
  screenWidth = 0;
  creatorList = [];
  searchTypeList = [];
  VehicleListAll = [];
  StationBufferListAll = [];
  AlarmcodeListAll = [];

  now: Date = new Date();
  start: Date = new Date(
    this.now.getFullYear(),
    this.now.getMonth() - 1,
    this.now.getDate()
  );
  end: Date = new Date(
    this.now.getFullYear(),
    this.now.getMonth(),
    this.now.getDate(),
    this.now.getHours(),
    this.now.getMinutes() + 30
  );
  fileName: string;

  dataSetResult: IPaginatedResult<IAlarmHistoryRow>;

  constructor(private svc: HistoriesService) {}

  ngOnInit(): void {
    this.getScreenWidth();
    this.getFileName();
  }

  search() {
    this.svc.alarms().subscribe((res) => {
      this.dataSetResult = res;
    });
  }

  private getScreenWidth(): void {
    this.screenWidth = window.screen.width - 20;
  }
  private getFileName() {
    var offset = new Date().getTimezoneOffset() * 60000;
    var today = new Date(Date.now() - offset);
    this.fileName = today.toISOString() + '-order_history';
  }
}
