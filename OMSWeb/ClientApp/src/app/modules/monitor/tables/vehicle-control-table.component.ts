import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'oms-vehicle-control-table',
  templateUrl: './vehicle-control-table.component.html',
  styleUrls: ['./vehicle-control-table.component.scss'],
})
export class VehicleControlTableComponent implements OnInit {
  @Input() tableHeight: number;

  constructor() {}

  ngOnInit(): void {
    console.warn('vehicle control init');
  }
}
