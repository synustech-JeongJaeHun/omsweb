import { Component, OnInit } from '@angular/core';
import { IPaginatedResult } from '../../../models/base.model';
import { IVehicleHistoryRow } from '../../../models/history.model';
import { HistoriesService } from '../../../services/histories.service';

@Component({
  selector: 'oms-vehicle-history',
  templateUrl: './vehicle-history.component.html',
  styles: [
    `
      #transfer-history-page {
        background-color: var(--dialog-border-color);
        display: grid;
        grid-template-rows: auto auto;
        left: 0;
        right: 0;
        bottom: 0;
        top: 44px;
      }

      #transfer-filter-area {
        margin: 10px;
        display: grid;
        grid-template-columns: 150px 150px 150px 150px 150px 150px 210px 210px 120px;
        gap: 5px;
      }

      #transfer-result-area {
        padding: 10px;
      }

      #transfer-filter-area .dx-datebox {
        max-width: 150%;
      }
    `,
  ],
})
export class VehicleHistoryComponent implements OnInit {
  screenWidth = 0;
  creatorList = [];
  searchTypeList = [];
  VehicleListAll = [];
  StationBufferListAll = [];

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

  dataSetResult: IPaginatedResult<IVehicleHistoryRow>;

  constructor(private svc: HistoriesService) {}

  ngOnInit(): void {
    this.getScreenWidth();
    this.getFileName();
  }

  search() {
    this.svc.vehicles().subscribe((res) => {
      this.dataSetResult = res;
    });
  }

  private getScreenWidth(): void {
    this.screenWidth = window.screen.width - 20;
  }
  private getFileName() {
    var offset = new Date().getTimezoneOffset() * 60000;
    var today = new Date(Date.now() - offset);
    this.fileName = today.toISOString() + "-vehicle_history";
  }

  onExporting(e) {
    console.info('exporting >>', e);
  }
}
