import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import _ = require('lodash');

@Component({
  selector: 'oms-unit-picker',
  templateUrl: './unit-picker.component.html',
  styleUrls: ['./unit-picker.component.scss'],
})
export class UnitPickerComponent implements OnChanges {
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
	@Input() notEmptyPick = false;

  @Output() selectionChanged = new EventEmitter<number[]>();

  selectedAssignedIds: number[] = [];
  selectedUnassignedIds: number[] = [];
  unassigned: number[] = [];
  assigned: number[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    const { picked, pool } = changes;
    if (picked?.currentValue || pool?.currentValue) {
      this.getUnassigned(pool?.currentValue, picked?.currentValue);
      //this.getChanged(pool?.currentValue, picked?.currentValue);
    }
    this.sort('all')
  }

  onAssign() {
    if (this.selectedUnassignedIds.length) {
      this.picked = [...this.picked, ...this.selectedUnassignedIds];
      this.getChanged(this.pool, this.picked);
      this.selectionChanged.emit(this.picked);
    }
    this.sort('picked')
  }
  onUnassign() {
    if (this.selectedAssignedIds.length) {
      this.picked = this.picked.filter(
        (x) => !this.selectedAssignedIds.includes(x)
      );
      this.pool = [...this.pool, ...this.selectedAssignedIds];
      this.getChanged(this.pool, this.picked);
      this.selectionChanged.emit(this.picked);
    }
    this.sort('pool')
  }

  private sort(target: "all" | "picked" | "pool"){
    if(target !== 'pool')
      this.picked.sort((a, b) => a - b)

    if(target !== 'picked')
      this.pool.sort((a, b) => a - b)
  }

  private getUnassigned(pool: number[] = [], picked: number[] = []) {
    this.unassigned = _.difference(pool, picked);
    this.pool = this.unassigned;
  }

  private getChanged(pool: number[] = [], picked: number[] = []) {
    this.unassigned = _.difference(pool, picked);
    this.pool = this.unassigned;
    this.picked = picked;
  }
	
	get isDisable(){
		return this.disabled || this.notEmptyPick && (this.picked.length < 2 || this.selectedAssignedIds.length === this.picked.length)
	}
}
