import { Component, OnInit } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { DateUtil } from '../../shared/utils/date.util';

@Component({
  selector: 'oms-normal-tr-reports',
  templateUrl: './normal-tr-report.component.html',
  styleUrls: ['./normal-tr-report.component.scss'],
})
export class NormalTRReportComponent implements OnInit {

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

  normalTRbyPeriodData: any[] = [];
  normalTRbyVehicleData: any[] = [];
  normalTRbySourceData: any[] = [];
  normalTRbyDestData: any[] = [];

  constructor() {
    let normalTRbyPeriodData: any[] = [
      {
        period: 1,
        transferAmount: 149,
        avgTransfer: 0.45
      },
      {
        period: 2,
        transferAmount: 168,
        avgTransfer: 0.47
      },
      {
        period: 3,
        transferAmount: 140,
        avgTransfer: 0.43
      },
      {
        period: 4,
        transferAmount: 200,
        avgTransfer: 0.52
      }
    ];

    let normalTRbyVehicleData: any[] = [
      {
        vehicleId: 1,
        vehicleName: "VEH_001",
        transferAmount: 149,
        avgTransfer: 0.12
      },
      {
        vehicleId: 2,
        vehicleName: "VEH_002",
        transferAmount: 168,
        avgTransfer: 0.45
      },
      {
        vehicleId: 3,
        vehicleName: "VEH_003",
        transferAmount: 140,
        avgTransfer: 0.32
      },
      {
        vehicleId: 4,
        vehicleName: "VEH_004",
        transferAmount: 170,
        avgTransfer: 0.55
      },
      {
        vehicleId: 5,
        vehicleName: "VEH_005",
        transferAmount: 170,
        avgTransfer: 0.55
      },
      {
        vehicleId: 6,
        vehicleName: "VEH_006",
        transferAmount: 140,
        avgTransfer: 0.3
      }
    ];

    let normalTRbySourceData: any[] = [
      {
        SourceId: 1,
        SourceName: "PORT_01",
        transferAmount: 149,
        avgTransfer: 0.45
      },
      {
        SourceId: 2,
        SourceName: "PORT_02",
        transferAmount: 168,
        avgTransfer: 0.4
      },
      {
        SourceId: 3,
        SourceName: "PORT_03",
        transferAmount: 140,
        avgTransfer: 0.3
      },
      {
        SourceId: 4,
        SourceName: "PORT_04",
        transferAmount: 170,
        avgTransfer: 0.45
      },
      {
        SourceId: 5,
        SourceName: "PORT_05",
        transferAmount: 130,
        avgTransfer: 0.35
      },
      {
        SourceId: 6,
        SourceName: "PORT_06",
        transferAmount: 170,
        avgTransfer: 0.55
      }
    ];

    let normalTRbyDestData: any[] = [
      {
        DestinationId: 1,
        DestinationName: "PORT_11",
        transferAmount: 149,
        avgTransfer: 0.45
      },
      {
        DestinationId: 2,
        DestinationName: "PORT_12",
        transferAmount: 168,
        avgTransfer: 0.4
      },
      {
        DestinationId: 3,
        DestinationName: "PORT_13",
        transferAmount: 140,
        avgTransfer: 0.6
      },
      {
        DestinationId: 4,
        DestinationName: "PORT_14",
        transferAmount: 120,
        avgTransfer: 0.25
      },
      {
        DestinationId: 5,
        DestinationName: "PORT_15",
        transferAmount: 170,
        avgTransfer: 0.55
      },
      {
        DestinationId: 6,
        DestinationName: "PORT_16",
        transferAmount: 150,
        avgTransfer: 0.35
      }
    ];

    this.normalTRbyPeriodData = normalTRbyPeriodData;
    this.normalTRbyVehicleData = normalTRbyVehicleData;
    this.normalTRbySourceData = normalTRbySourceData;
    this.normalTRbyDestData = normalTRbyDestData;
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
    const containerByPeriod = document.getElementById('grid-container-normalTRbyPeriod');
    const { offsetHeight, offsetWidth } = containerByPeriod;
    this.gridWidthByPeriod = offsetWidth - 10;
    this.gridHeightByPeriod = offsetHeight - 74;
    //alert(this.gridWidth + ' - ' + this.gridHeight);
  }
  private getGridSizeByVehicle(): void {
    const containerByVehicle = document.getElementById('grid-container-normalTRbyVehicle');
    const { offsetHeight, offsetWidth } = containerByVehicle;
    this.gridWidthByVehicle = offsetWidth - 10;
    this.gridHeightByVehicle = offsetHeight - 74;
  }
  private getGridSizeBySource(): void {
    const containerBySource = document.getElementById('grid-container-normalTRbySource');
    const { offsetHeight, offsetWidth } = containerBySource;
    this.gridWidthBySource = offsetWidth - 10;
    this.gridHeightBySource = offsetHeight - 74;
  }
  private getGridSizeByDest(): void {
    const containerByDest = document.getElementById('grid-container-normalTRbyDest');
    const { offsetHeight, offsetWidth } = containerByDest;
    this.gridWidthByDest = offsetWidth - 10;
    this.gridHeightByDest = offsetHeight - 74;
  }

  transformPeriod = ({ value = '' }): string => {
    return value + '월';
  };

}
