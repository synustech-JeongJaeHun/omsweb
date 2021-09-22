import { Component, OnInit } from '@angular/core';
import { DxDataGridComponent } from 'devextreme-angular';
import { DateUtil } from '../../shared/utils/date.util';


@Component({
  selector: 'oms-alarm-reports',
  templateUrl: './alarm-report.component.html',
  styleUrls: ['./alarm-report.component.scss'],
})
export class AlarmReportComponent implements OnInit {

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

  alarmByPeriodData: any[] = [];
  alarmByVehicleData: any[] = [];
  alarmByAlarmData: any[] = [];
  alarmBySegmentData: any[] = [];

  constructor() {
    let alarmByPeriodData: any[] = [
      {
        period: 1,
        alarmAmount: 149,
        avgAlarm: 0.45
      },
      {
        period: 2,
        alarmAmount: 168,
        avgAlarm: 0.47
      },
      {
        period: 3,
        alarmAmount: 140,
        avgAlarm: 0.43
      },
      {
        period: 4,
        alarmAmount: 200,
        avgAlarm: 0.52
      }
    ];

    let alarmByVehicleData: any[] = [
      {
        vehicleId: 1,
        vehicleName: "VEH_001",
        alarmAmount: 149,
        avgAlarm: 0.12
      },
      {
        vehicleId: 2,
        vehicleName: "VEH_002",
        alarmAmount: 168,
        avgAlarm: 0.45
      },
      {
        vehicleId: 3,
        vehicleName: "VEH_003",
        alarmAmount: 140,
        avgAlarm: 0.32
      },
      {
        vehicleId: 4,
        vehicleName: "VEH_004",
        alarmAmount: 170,
        avgAlarm: 0.55
      },
      {
        vehicleId: 5,
        vehicleName: "VEH_005",
        alarmAmount: 170,
        avgAlarm: 0.55
      },
      {
        vehicleId: 6,
        vehicleName: "VEH_006",
        alarmAmount: 140,
        avgAlarm: 0.3
      }
    ];

    let alarmByAlarmData: any[] = [
      {
        alarmId: 1,
        alarmName: "ALARM_1",
        alarmAmount: 149,
        avgAlarm: 0.45
      },
      {
        alarmId: 2,
        alarmName: "ALARM_2",
        alarmAmount: 168,
        avgAlarm: 0.4
      },
      {
        alarmId: 3,
        alarmName: "ALARM_3",
        alarmAmount: 140,
        avgAlarm: 0.3
      },
      {
        alarmId: 4,
        alarmName: "ALARM_4",
        alarmAmount: 170,
        avgAlarm: 0.45
      },
      {
        alarmId: 5,
        alarmName: "ALARM_5",
        alarmAmount: 130,
        avgAlarm: 0.35
      },
      {
        alarmId: 6,
        alarmName: "ALARM_6",
        alarmAmount: 170,
        avgAlarm: 0.55
      }
    ];

    let alarmBySegmentData: any[] = [
      {
        segmentId: 1,
        segmentName: "C1_SEG01",
        alarmAmount: 149,
        avgAlarm: 0.45
      },
      {
        segmentId: 2,
        segmentName: "C1_SEG02",
        alarmAmount: 168,
        avgAlarm: 0.4
      },
      {
        segmentId: 3,
        segmentName: "C1_SEG03",
        alarmAmount: 140,
        avgAlarm: 0.6
      },
      {
        segmentId: 4,
        segmentName: "C1_SEG04",
        alarmAmount: 120,
        avgAlarm: 0.25
      },
      {
        segmentId: 5,
        segmentName: "C1_SEG05",
        alarmAmount: 170,
        avgAlarm: 0.55
      },
      {
        segmentId: 6,
        segmentName: "C1_SEG06",
        alarmAmount: 150,
        avgAlarm: 0.35
      }
    ];

    this.alarmByPeriodData = alarmByPeriodData;
    this.alarmByVehicleData = alarmByVehicleData;
    this.alarmByAlarmData = alarmByAlarmData;
    this.alarmBySegmentData = alarmBySegmentData;
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
    const containerByPeriod = document.getElementById('grid-container-alarmByPeriod');
    const { offsetHeight, offsetWidth } = containerByPeriod;
    this.gridWidthByPeriod = offsetWidth - 10;
    this.gridHeightByPeriod = offsetHeight - 74;
    //alert(this.gridWidth + ' - ' + this.gridHeight);
  }
  private getGridSizeByVehicle(): void {
    const containerByVehicle = document.getElementById('grid-container-alarmByVehicle');
    const { offsetHeight, offsetWidth } = containerByVehicle;
    this.gridWidthByVehicle = offsetWidth - 10;
    this.gridHeightByVehicle = offsetHeight - 74;
  }
  private getGridSizeBySource(): void {
    const containerBySource = document.getElementById('grid-container-alarmByAlarm');
    const { offsetHeight, offsetWidth } = containerBySource;
    this.gridWidthBySource = offsetWidth - 10;
    this.gridHeightBySource = offsetHeight - 74;
  }
  private getGridSizeByDest(): void {
    const containerByDest = document.getElementById('grid-container-alarmBySegment');
    const { offsetHeight, offsetWidth } = containerByDest;
    this.gridWidthByDest = offsetWidth - 10;
    this.gridHeightByDest = offsetHeight - 74;
  }

  transformPeriod = ({ value = '' }): string => {
    return value + '월';
  };

}
