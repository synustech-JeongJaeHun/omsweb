import { Component, OnInit } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { DateUtil } from '../../shared/utils/date.util';


@Component({
  selector: 'oms-abnormal-tr-reports',
  templateUrl: './abnormal-tr-report.component.html',
  styleUrls: ['./abnormal-tr-report.component.scss'],
})
export class AbnormalTRReportComponent implements OnInit {

  dateTimeFormat = DateUtil.DateTimeFormat;

  gridWidthByPeriod = 0;
  gridHeightByPeriod = 0;
  gridWidthByVehicle = 0;
  gridHeightByVehicle = 0;
  gridWidthBySource = 0;
  gridHeightBySource = 0;
  gridWidthByDest = 0;
  gridHeightByDest = 0;

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

  types: string[] = ["splinearea", "stackedsplinearea", "fullstackedsplinearea", "spline"];

  normalTRbyVehicleData: any[] = [];
  normalTRbySourceData: any[] = [];
  normalTRbyDestData: any[] = [];

  abnormalTRbyPeriodData: any[] = [];
  abnormalTRbyVehicleData: any[] = [];
  abnormalTRbySourceData: any[] = [];
  abnormalTRbyDestData: any[] = [];

  constructor() {
    let abnormalTRbyPeriodData: any[] = [
      {
        period: 4,
        duplicate: 4,
        mismatch: 1,
        readfail: 2,
        dest: 1,
        source: 1,
        abort: 2,
        cancel: 3,
        total: 14
      },
      {
        period: 5,
        duplicate: 1,
        mismatch: 2,
        readfail: 4,
        dest: 1,
        source: 1,
        abort: 4,
        cancel: 3,
        total: 16
      },
      {
        period: 6,
        duplicate: 3,
        mismatch: 1,
        readfail: 2,
        dest: 3,
        source: 3,
        abort: 2,
        cancel: 1,
        total: 15
      },
      {
        period: 7,
        duplicate: 1,
        mismatch: 2,
        readfail: 2,
        dest: 1,
        source: 4,
        abort: 3,
        cancel: 2,
        total: 15
      }
    ];

    let abnormalTRbyVehicleData: any[] = [
      {
        vehicleId: 1,
        vehicleName: "VEH_001",
        duplicate: 4,
        mismatch: 1,
        readfail: 2,
        dest: 1,
        source: 1,
        abort: 2,
        cancel: 3,
        total: 14
      },
      {
        vehicleId: 2,
        vehicleName: "VEH_002",
        duplicate: 1,
        mismatch: 2,
        readfail: 4,
        dest: 1,
        source: 1,
        abort: 4,
        cancel: 3,
        total: 16
      },
      {
        vehicleId: 3,
        vehicleName: "VEH_003",
        duplicate: 3,
        mismatch: 1,
        readfail: 2,
        dest: 3,
        source: 3,
        abort: 2,
        cancel: 1,
        total: 15
      },
      {
        vehicleId: 4,
        vehicleName: "VEH_004",
        duplicate: 1,
        mismatch: 2,
        readfail: 2,
        dest: 1,
        source: 4,
        abort: 3,
        cancel: 2,
        total: 15
      },
      {
        vehicleId: 5,
        vehicleName: "VEH_005",
        duplicate: 1,
        mismatch: 2,
        readfail: 4,
        dest: 1,
        source: 1,
        abort: 4,
        cancel: 3,
        total: 16
      },
      {
        vehicleId: 6,
        vehicleName: "VEH_006",
        duplicate: 1,
        mismatch: 2,
        readfail: 2,
        dest: 1,
        source: 4,
        abort: 3,
        cancel: 2,
        total: 15
      }
    ];

    let abnormalTRbySourceData: any[] = [
      {
        SourceId: 1,
        SourceName: "PORT_01",
        duplicate: 4,
        mismatch: 1,
        readfail: 2,
        dest: 1,
        source: 1,
        abort: 2,
        cancel: 3,
        total: 14
      },
      {
        SourceId: 2,
        SourceName: "PORT_02",
        duplicate: 3,
        mismatch: 1,
        readfail: 2,
        dest: 3,
        source: 3,
        abort: 2,
        cancel: 1,
        total: 15
      },
      {
        SourceId: 3,
        SourceName: "PORT_03",
        duplicate: 1,
        mismatch: 2,
        readfail: 4,
        dest: 1,
        source: 1,
        abort: 4,
        cancel: 3,
        total: 16
      },
      {
        SourceId: 4,
        SourceName: "PORT_04",
        duplicate: 1,
        mismatch: 2,
        readfail: 4,
        dest: 1,
        source: 1,
        abort: 4,
        cancel: 3,
        total: 16
      },
      {
        SourceId: 5,
        SourceName: "PORT_05",
        duplicate: 1,
        mismatch: 2,
        readfail: 2,
        dest: 1,
        source: 4,
        abort: 3,
        cancel: 2,
        total: 15
      },
      {
        SourceId: 6,
        SourceName: "PORT_06",
        duplicate: 1,
        mismatch: 2,
        readfail: 2,
        dest: 1,
        source: 4,
        abort: 3,
        cancel: 2,
        total: 15
      }
    ];

    let abnormalTRbyDestData: any[] = [
      {
        DestinationId: 1,
        DestinationName: "PORT_11",
        duplicate: 1,
        mismatch: 2,
        readfail: 2,
        dest: 1,
        source: 4,
        abort: 3,
        cancel: 2,
        total: 15
      },
      {
        DestinationId: 2,
        DestinationName: "PORT_12",
        duplicate: 1,
        mismatch: 2,
        readfail: 4,
        dest: 1,
        source: 1,
        abort: 4,
        cancel: 3,
        total: 16
      },
      {
        DestinationId: 3,
        DestinationName: "PORT_13",
        duplicate: 3,
        mismatch: 1,
        readfail: 2,
        dest: 3,
        source: 3,
        abort: 2,
        cancel: 1,
        total: 15
      },
      {
        DestinationId: 4,
        DestinationName: "PORT_14",
        duplicate: 3,
        mismatch: 1,
        readfail: 2,
        dest: 3,
        source: 3,
        abort: 2,
        cancel: 1,
        total: 15
      },
      {
        DestinationId: 5,
        DestinationName: "PORT_15",
        duplicate: 1,
        mismatch: 2,
        readfail: 2,
        dest: 1,
        source: 4,
        abort: 3,
        cancel: 2,
        total: 15
      },
      {
        DestinationId: 6,
        DestinationName: "PORT_16",
        duplicate: 4,
        mismatch: 1,
        readfail: 2,
        dest: 1,
        source: 1,
        abort: 2,
        cancel: 3,
        total: 14
      }
    ];

    this.abnormalTRbyPeriodData = abnormalTRbyPeriodData;
    this.abnormalTRbyVehicleData = abnormalTRbyVehicleData;
    this.abnormalTRbySourceData = abnormalTRbySourceData;
    this.abnormalTRbyDestData = abnormalTRbyDestData;
  }

  ngOnInit(): void {
    this.getGridSizeByPeriod();
    this.getGridSizeByVehicle();
    this.getGridSizeBySource();
    this.getGridSizeByDest();
  }

  search(startTime: Date, endTime: Date) {
    //this.applyFilter(startTime, endTime);
    //this.dataSource.reload();
  }

  customizeTooltip(arg: any) {
    var items = arg.valueText.split("\n"),
      color = arg.point.getColor();
    items.forEach(function (item, index) {
      if (item.indexOf(arg.seriesName) === 0) {
        var element = document.createElement("span");

        element.textContent = item;
        element.style.color = color;
        element.className = "active";

        items[index] = element.outerHTML;
      }
    });
    return { text: items.join("\n") };
  }

  private getGridSizeByPeriod(): void {
    //const container = document.body;
    const containerByPeriod = document.getElementById('grid-container-abnormalTRbyPeriod');
    const { offsetHeight, offsetWidth } = containerByPeriod;
    this.gridWidthByPeriod = offsetWidth - 10;
    this.gridHeightByPeriod = offsetHeight - 74;
    //alert(this.gridWidth + ' - ' + this.gridHeight);
  }
  private getGridSizeByVehicle(): void {
    const containerByVehicle = document.getElementById('grid-container-abnormalTRbyVehicle');
    const { offsetHeight, offsetWidth } = containerByVehicle;
    this.gridWidthByVehicle = offsetWidth - 10;
    this.gridHeightByVehicle = offsetHeight - 74;
  }
  private getGridSizeBySource(): void {
    const containerBySource = document.getElementById('grid-container-abnormalTRbySource');
    const { offsetHeight, offsetWidth } = containerBySource;
    this.gridWidthBySource = offsetWidth - 10;
    this.gridHeightBySource = offsetHeight - 74;
  }
  private getGridSizeByDest(): void {
    const containerByDest = document.getElementById('grid-container-abnormalTRbyDest');
    const { offsetHeight, offsetWidth } = containerByDest;
    this.gridWidthByDest = offsetWidth - 10;
    this.gridHeightByDest = offsetHeight - 74;
  }

  transformPeriod = ({ value = '' }): string => {
    return value + '월';
  };

}
