import { Component, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { HistoriesService } from '../../../services/histories.service';
import { TrackIdService } from '../../../services/track-id.service';
import { DateUtil } from '../../shared/utils/date.util';

@Component({
  selector: 'oms-warning-history',
  templateUrl: './warning-history.component.html',
  styles: [
    `
      #history-page {
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
        padding: 0 10px;
      }

      #filter-area .dx-datebox {
      }
    `,
  ],
})
export class WarningHistoryComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  dateTimeFormat = DateUtil.DateTimeFormat;
  gridWidth = 0;
  gridHeight = 0;
  creatorList = [];
  searchTypeList = [];

  now: Date = new Date();
  start: Date = new Date(
    this.now.getFullYear(),
    this.now.getMonth(),
    this.now.getDate(),
    this.now.getHours() - 6
  );
  base: Date = new Date(
    this.now.getFullYear() - 20,
    this.now.getMonth(),
    this.now.getDate(),
  );
  end: Date = new Date(
    this.now.getFullYear(),
    this.now.getMonth(),
    this.now.getDate(),
    this.now.getHours(),
    this.now.getMinutes() + 30
  );
  fileName: string;

  dataSource: DataSource;

  searchTime: string
  startSearch: number
  endSearch: number

  transformVehicleId = ({ value = '' }): string => {
    const text =
      this.idSvc.get_alternative_id('vehicle', 'logicalId', value) || value;
    return text.toString();
  };

  transformLocationId = ({ value = '' }): string => {
    return this.idSvc.guessLocationId(value);
  };

  constructor(private svc: HistoriesService, private idSvc: TrackIdService) {
    window.onresize = this.getGridSize.bind(this);
    this.idSvc.loadIds().subscribe(() => {
      this.dataSource = this.svc.alertsDataSource(this, this.start, this.end);
    });
  }

  ngOnDestroy(): void {
    window.onresize = null;
  }

  ngOnInit(): void {
    this.getGridSize();
    this.getFileName();
  }

  search(startTime: Date, endTime: Date) {
    this.searchTime = ''
    this.startSearch = Date.now();

    this.applyFilter(startTime, endTime);
    this.dataSource.reload().then(function (data) {
      this.onDataSourceChanged();
    })
  }
  private applyFilter(startTime: Date, endTime: Date) {
    this.dataGrid.instance.filter([
      ['time', '>=', startTime],
      'and',
      ['time', '<=', endTime],
    ]);
  }

  private getGridSize(): void {
    const container = document.body;
    // const container = document.getElementById('grid-container');
    const { offsetHeight, offsetWidth } = container;
    this.gridWidth = offsetWidth - 20;
    this.gridHeight = offsetHeight - 94;
  }
  private getFileName() {
    var offset = new Date().getTimezoneOffset() * 60000;
    var today = new Date(Date.now() - offset);
    this.fileName = today.toISOString() + '-warning_history';
  }

  public onDataSourceChanged() {
    this.endSearch = Date.now();
    var gap = this.endSearch - this.startSearch;

    const days = Math.floor(gap / (1000 * 60 * 60 * 24)); // 일
    const hour = String(Math.floor((gap / (1000 * 60 * 60)) % 24)).padStart(2, "0"); // 시
    const minutes = String(Math.floor((gap / (1000 * 60)) % 60)).padStart(2, "0"); // 분
    const second = String(Math.floor((gap / 1000) % 60)).padStart(2, "0"); // 초
    const milisec = String(Math.floor(gap % 1000)).padStart(3, "0"); // 밀리

    this.searchTime = hour + ':' + minutes + ':' + second + "." + milisec;
    console.log('time Warning history: ' + this.searchTime)
  }
}
