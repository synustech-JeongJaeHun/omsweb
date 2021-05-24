import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ILookupUnit } from '../../../models/map.interface';
import {
  IVehicleDIO,
  IVehicleDIOStates,
  IVehicleSignal,
} from '../../../models/vehicle-status.model';
import { Vehicle } from '../../../models/vehicle.model';
import { StatusService } from '../../../services/status.service';
import { MapDataService } from '../map-data.service';

@Component({
  selector: 'oms-vehicle-status-dialog',
  templateUrl: './vehicle-status-dialog.component.html',
  styleUrls: ['./vehicle-status-dialog.component.scss'],
})
export class VehicleStatusDialogComponent implements OnInit {
  selectedUnit: Vehicle;
  currentVehicle: any;
  signalStatus: IVehicleSignal;
  diMap: { [key: string]: IVehicleDIO[] } = {};
  doMap: { [key: string]: IVehicleDIO[] } = {};
  ioCategories: string[] = ['Transfer', 'OBS', 'ZCU', 'PIO', 'OTHER'];
  vehicles: Vehicle[];

  private showOptions: { [key: string]: boolean } = {};

  constructor(
    private dataSvc: MapDataService,
    private statusSvc: StatusService
  ) {}

  ngOnInit(): void {
    // this.currentVehicle = {};
    this.vehicles = this.dataSvc.data.vehicles;
    this.initShowOptions();
    this.getFirstUnit();
  }

  onUnitChange(data: Vehicle) {
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

  private getFirstUnit() {
    const { vehicles } = this.dataSvc.data;
    if (vehicles.length > 0) {
      this.currentVehicle = vehicles[0];
      const { id, objectType } = this.currentVehicle;
      this.selectedUnit = this.currentVehicle;
      // this.selectedUnit = {
      //   id,
      //   objectType,
      // };
      this.getSignal(id);
      this.getIoStates(id);
    }
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
}
