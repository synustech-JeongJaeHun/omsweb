import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import _ = require('lodash');
import { Observable, of } from 'rxjs';

@Component({
  selector: 'oms-unit-picker',
  templateUrl: './unit-picker.component.html',
  styleUrls: ['./unit-picker.component.scss'],
})
export class UnitPickerComponent implements OnInit, OnChanges {
  @Input() title: string;
  @Input() unitName: string;
  @Input() gridHeight: number = 200;

  @Input() disabled = false;

  @Input() pool: number[] = [];
  @Input() visibleUnassigned = true;
  @Input() widthUnassigned = 120;
  @Input() widthColumnUnassigned = 58;
  @Input() selectionModeUnassigned = "multiple";

  @Input() picked: number[] = [];
  @Input() visibleAssigned = true;
  @Input() widthAssigned = 120;
  @Input() widthColumnAssigned = 58;
  @Input() selectionModeAssigned = "multiple";

  @Input() visibleAction = true;

  @Output() selectionChanged = new EventEmitter<number[]>();

  selectedAssignedIds: number[] = [];
  selectedUnassignedIds: number[] = [];
  unassigned: number[] = [];

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    const { picked, pool } = changes;
    if (picked?.currentValue || pool?.currentValue) {
      this.getUnassigned(pool?.currentValue, picked?.currentValue);
    }
  }

  ngOnInit(): void { }

  onAssign() {
    if (this.selectedUnassignedIds.length) {
      this.picked = [...this.picked, ...this.selectedUnassignedIds];
      this.getUnassigned(this.pool, this.picked);
      this.selectionChanged.emit(this.picked);
    }
  }
  onUnassign() {
    if (this.selectedAssignedIds.length) {
      this.picked = this.picked.filter(
        (x) => !this.selectedAssignedIds.includes(x)
      );
      this.getUnassigned(this.pool, this.picked);
      this.selectionChanged.emit(this.picked);
    }
  }

  private getUnassigned(pool: number[] = [], picked: number[] = []) {
    this.unassigned = _.difference(pool, picked);
  }
}
