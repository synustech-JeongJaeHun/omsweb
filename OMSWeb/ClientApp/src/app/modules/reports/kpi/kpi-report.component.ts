import { Component, enableProdMode, OnInit } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { DateUtil } from '../../shared/utils/date.util';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  selector: 'oms-kpi-reports',
  templateUrl: './kpi-report.component.html',
  styleUrls: ['./kpi-report.component.scss'],
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

  types: string[] = ["splinearea", "stackedsplinearea", "fullstackedsplinearea", "spline"];

  vehicleUtilizationData: any[] = [];
  vehicleDeliveryTimeData: any[] = [];

  vehicleStatusData: any[] = [];
  vehicleLoadingUnloadingData: any[] = [];

  cpuSystemInfoData: any[] = [];
  memorySystemInfoData: any[] = [];

  constructor() {

    let utilizationData: any[] = [
      {
        period: 1,
        utilization: 50
      },
      {
        period: 2,
        utilization: 55
      },
      {
        period: 3,
        utilization: 50.2
      },
      {
        period: 4,
        utilization: 60.7
      },
      {
        period: 5,
        utilization: 63.5
      },
      {
        period: 6,
        utilization: 33.2
      },
      {
        period: 6,
        utilization: 93.2
      }
    ];

    let deliveryTimeData: any[] = [
      {
        period: 1,
        deliveryTime: 90.3
      },
      {
        period: 2,
        deliveryTime: 100
      },
      {
        period: 3,
        deliveryTime: 110.2
      },
      {
        period: 4,
        deliveryTime: 56.7
      },
      {
        period: 5,
        deliveryTime: 106.5
      },
      {
        period: 6,
        deliveryTime: 33.2
      },
      {
        period: 6,
        deliveryTime: 193.2
      }
    ];

    let vehicleStatus: any[] = [
      {
        status: "Error",
        count: 30
      },
      {
        status: "Idle",
        count: 20
      },
      {
        status: "Manual",
        count: 0
      },
      {
        status: "Auto",
        count: 200
      }
    ];

    let vehicleLoadingUnloading: any[] = [
      {
        status: "Loading",
        count: 95
      },
      {
        status: "Unloading",
        count: 155
      }
    ];

    let cpuData: any[] = [
      {
        period: 1,
        cpu: 50
      },
      {
        period: 2,
        cpu: 55
      },
      {
        period: 3,
        cpu: 50.2
      },
      {
        period: 4,
        cpu: 60.7
      },
      {
        period: 5,
        cpu: 63.5
      },
      {
        period: 6,
        cpu: 33.2
      },
      {
        period: 7,
        cpu: 93.2
      }
    ];

    let memoryData: any[] = [
      {
        period: 1,
        memory: 50
      },
      {
        period: 2,
        memory: 55
      },
      {
        period: 3,
        memory: 50.2
      },
      {
        period: 4,
        memory: 60.7
      },
      {
        period: 5,
        memory: 63.5
      },
      {
        period: 6,
        memory: 33.2
      },
      {
        period: 7,
        memory: 53.2
      }
    ];

    this.vehicleUtilizationData = utilizationData;
    this.vehicleDeliveryTimeData = deliveryTimeData;

    this.vehicleStatusData = vehicleStatus;
    this.vehicleLoadingUnloadingData = vehicleLoadingUnloading;

    this.cpuSystemInfoData = cpuData;
    this.memorySystemInfoData = memoryData;
  }

  ngOnInit(): void { }

  search(startTime: Date, endTime: Date) {
    //this.applyFilter(startTime, endTime);
    //this.dataSource.reload();
  }

  pointClickHandler(arg) {
    arg.target.select();
  }
}
