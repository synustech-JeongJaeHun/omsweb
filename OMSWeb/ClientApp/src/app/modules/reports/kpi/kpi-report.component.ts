import { Component, OnInit } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { DateUtil } from '../../shared/utils/date.util';

@Component({
  selector: 'oms-kpi-reports',
  templateUrl: './kpi-report.component.html',
  styles: [
    `
      #kpi-report-page {
        background-color: var(--panel-background-color);
        display: grid;
        grid-template-rows: 40px auto;
        left: 0;
        right: 0;
        bottom: 0;
        top: 44px;
        gap: 4px;
        height: 100%;
      }

      #filter-area {
        padding: 4px 10px;
        display: grid;
        grid-template-columns: 210px 10px 210px 120px;
        justify-items: center;
        align-items: center;
        gap: 4px;
      }

      #filter-area button {
        justify-self: normal;
        align-self: normal;
      }

      #grid-container {
        margin: 20px;
        padding: 10px 10px;
      }

      #filter-area .dx-datebox {
      }

      .table-details {
        width: 100%;

        .name {
        width: 210px;
        }
      }
    `,
  ],
})
export class KpiReportComponent implements OnInit {

  dateTimeFormat = DateUtil.DateTimeFormat;
  gridWidth = 0;
  gridHeight = 0;
  creatorList = [];
  searchTypeList = [];

  now: Date = new Date();
  start: Date = new Date(
    this.now.getFullYear(),
    this.now.getMonth(),
    this.now.getDate() - 7
  );
  end: Date = new Date(
    this.now.getFullYear(),
    this.now.getMonth(),
    this.now.getDate(),
    this.now.getHours(),
    this.now.getMinutes() + 30
  );

  constructor() { }

  ngOnInit(): void { }

  search(startTime: Date, endTime: Date) {
    //this.applyFilter(startTime, endTime);
    //this.dataSource.reload();
  }
}
