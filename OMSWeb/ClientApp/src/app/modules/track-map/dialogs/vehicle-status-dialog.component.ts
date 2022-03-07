import { Component, enableProdMode, OnInit } from '@angular/core';
import {
  IVehicleDIO,
  IVehicleDIOStates,
  IVehicleSignal,
} from '../../../models/vehicle-status.model';
import { StatusService } from '../../../services/status.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { TrackStatusService } from '@oms/root/services/track-status.service';
import { Dto } from '@oms/root/models/dto/track.model';

if (!/localhost/.test(document.location.host)) {
  enableProdMode();
}

@Component({
  selector: 'oms-vehicle-status-dialog',
  templateUrl: './vehicle-status-dialog.component.html',
  styleUrls: ['./vehicle-status-dialog.component.scss'],
})
export class VehicleStatusDialogComponent implements OnInit {
  selectedUnit: Dto.IVehicle;
  currentVehicle: any;
  signalStatus: IVehicleSignal;
  diMap: { [key: string]: IVehicleDIO[] } = {};
  doMap: { [key: string]: IVehicleDIO[] } = {};
  ioCategories: string[] = ['Transfer', 'OBS', 'ZCU', 'PIO', 'OTHER'];
  vehicles: Dto.IVehicle[];

  pioTrendData: any[] = [];

  visiblePIOTrend = false;

  private showOptions: { [key: string]: boolean } = {};

  constructor(
    private dialogRef: MatDialogRef<VehicleStatusDialogComponent>,
    private trackStatusService: TrackStatusService,
    private statusSvc: StatusService,
    private t$: TranslateService
  ) {

    let pioTrendData: any[] = [
      {
        period: 1,
        valid: 0,
        cs_0: 0,
        cs_1: 0,
        tr_req: 0,
        busy: 0,
        compt: 1,
        cont: 0,
        l_req: 1,
        u_req: 0,
        ready: 0,
        hd_avbl: 0,
        es: 1,
        carrier_detection: 1,
        load_handler_detection: 0
      },
      {
        period: 2,
        valid: 0,
        cs_0: 1,
        cs_1: 0,
        tr_req: 0,
        busy: 0,
        compt: 1,
        cont: 1,
        l_req: 1,
        u_req: 1,
        ready: 1,
        hd_avbl: 1,
        es: 0,
        carrier_detection: 0,
        load_handler_detection: 1
      },
      {
        period: 3,
        valid: 1,
        cs_0: 1,
        cs_1: 0,
        tr_req: 0,
        busy: 0,
        compt: 0,
        cont: 1,
        l_req: 0,
        u_req: 1,
        ready: 1,
        hd_avbl: 1,
        es: 0,
        carrier_detection: 0,
        load_handler_detection: 1
      },
      {
        period: 4,
        valid: 1,
        cs_0: 1,
        cs_1: 0,
        tr_req: 1,
        busy: 0,
        compt: 0,
        cont: 1,
        l_req: 1,
        u_req: 0,
        ready: 0,
        hd_avbl: 0,
        es: 1,
        carrier_detection: 1,
        load_handler_detection: 0,
      },
      {
        period: 5,
        valid: 1,
        cs_0: 1,
        cs_1: 0,
        tr_req: 1,
        busy: 1,
        compt: 1,
        cont: 0,
        l_req: 1,
        u_req: 0,
        ready: 0,
        hd_avbl: 0,
        es: 1,
        carrier_detection: 1,
        load_handler_detection: 0,
      },
      {
        period: 6,
        valid: 1,
        cs_0: 1,
        cs_1: 0,
        tr_req: 1,
        busy: 1,
        compt: 0,
        cont: 1,
        l_req: 0,
        u_req: 1,
        ready: 1,
        hd_avbl: 1,
        es: 0,
        carrier_detection: 0,
        load_handler_detection: 1
      }
    ];

    this.pioTrendData = pioTrendData;
  }

  ngOnInit(): void {
    this.vehicles = this.trackStatusService.trackData.vehicles;
    this.initShowOptions();

    if (this.vehicles.length > 0) {
      this.currentVehicle = this.vehicles[0];
      const { id } = this.currentVehicle;
      this.selectedUnit = this.currentVehicle;
      // this.selectedUnit = {
      //   id,
      //   objectType,
      // };
      this.getSignal(id);
      this.getIoStates(id);
    }
  }

  onUnitChange(data: Dto.IVehicle) {
    if (data) {
      const { id } = data;
      this.currentVehicle = data;
      // this.currentVehicle = this.dataSvc.data.vehicles.find((x) => x.id === id);
      this.getSignal(id);
      this.getIoStates(id);
    }
  }
  onVehicleSelect({ value }) {
    this.onUnitChange(value);
  }

  isSelectedCategory(name: string): boolean {
    if (Object.keys(this.showOptions).length === 0) return true;
    return this.showOptions[name];
  }
  onToggleCategory(name: string, checked: boolean) {
    this.showOptions[name] = !checked;
  }

  private getSignal(id: number) {
    this.statusSvc
      .getVehicleSignal(id)
      .subscribe((data) => (this.signalStatus = data));
  }
  private getIoStates(id: number) {
    this.statusSvc.vehicleDIOStates(id).subscribe((data) => {
      this.ioCategories.forEach((c) => {
        this.diMap[c] = data.vehicleDI.filter((x) => x.category === c);
        this.doMap[c] = data.vehicleDO.filter((x) => x.category === c);
      });
    });
  }

  private initShowOptions() {
    this.ioCategories.forEach((x) => (this.showOptions[x] = true));
  }

  onToggleVehicleStatusNPIOTrend(element) {

    this.visiblePIOTrend = !this.visiblePIOTrend;

    if (this.visiblePIOTrend) {
      //element.textContent = '<  Vehicle Status';
      element.textContent = '< ' + this.t$.translations[this.t$.currentLang].names.vehicleStatus;
      this.dialogRef.addPanelClass('pioTrend-modalbox');
      this.dialogRef.updateSize('930px', '800px');
    } else {
      //element.textContent = 'PIO Trend';
      element.textContent = this.t$.translations[this.t$.currentLang].names.pioTrend;
      this.dialogRef.removePanelClass('pioTrend-modalbox');
      this.dialogRef.updateSize('750px', '540px');
    }
  }
}
