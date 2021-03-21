import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'oms-command-dialog',
  templateUrl: './command-dialog.component.html',
  styleUrls: ['./command-dialog.component.scss'],
})
export class CommandDialogComponent implements OnInit {
  currentTab = 0;
  carrierId: string;

  vehicleList: [];
  pointList: [];
  portList: [];
  selectedVehicle: any;
  selectedPointId: any
  selectedFrom: any;
  selectedTo: any;
  isAuto = false;

  get canApply(): boolean {
    return true;
  }

  constructor() {}

  ngOnInit(): void {}

  onApply() {}
}
