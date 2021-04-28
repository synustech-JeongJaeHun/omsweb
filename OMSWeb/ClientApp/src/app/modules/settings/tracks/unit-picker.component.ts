import { Component, Input, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'oms-unit-picker',
  templateUrl: './unit-picker.component.html',
  styleUrls: ['./unit-picker.component.scss'],
})
export class UnitPickerComponent implements OnInit {
  @Input() title: string;
  @Input() unitName: string;

  assignedDataSource: Observable<any[]>;
  unassignedDataSource: Observable<any[]>;
  selectedAssignedIds: number[] = [];
  selectedUnassignedIds: number[] = [];

  constructor() {
    this.assignedDataSource = of([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
    this.unassignedDataSource = of([
      { id: 10 },
      { id: 20 },
      { id: 30 },
      { id: 40 },
      { id: 50 },
      { id: 60 },
      { id: 70 },
    ]);
  }

  ngOnInit(): void {}
}
