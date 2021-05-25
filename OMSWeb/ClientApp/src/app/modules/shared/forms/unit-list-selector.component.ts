import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ILookupUnit } from '../../../models/map.interface';
import { TrackIdService } from '../../../services/track-id.service';

@Component({
  selector: 'oms-unit-list-selector',
  templateUrl: './unit-list-selector.component.html',
  styleUrls: ['./unit-list-selector.component.scss']
})
export class UnitListSelectorComponent implements OnInit, OnChanges {
  @Input() findScopes: string[] = ['points', 'stations', 'buffers'];
  @Input() disabled: boolean = false;
  @Input() selectedUnit: ILookupUnit;
  @Input() placeholder: string;
  @Output() selectedUnitChange = new EventEmitter<ILookupUnit>();

  inputControl = new FormControl();
  targetOptions$: Observable<ILookupUnit[]>;

  constructor(private idSvc: TrackIdService) {}
  ngOnChanges(changes: SimpleChanges): void {
    const { disabled, selectedUnit } = changes;
    if (disabled) {
      disabled.currentValue
        ? this.inputControl.disable()
        : this.inputControl.enable();
    }

    // if (selectedUnit) {
    //   selectedUnit.currentValue && this.inputControl.setValue(selectedUnit.currentValue);
    // }
  }

  ngOnInit(): void {
    this.targetOptions$ = this.inputControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => this.idSvc.lookupUnits(this.findScopes, value, false))
    );
  }
  displayFn(item: ILookupUnit): string | undefined {
    if (!item) return;
    return `${item.objectType} #${item.id}`;
  }
  onSelected(item: ILookupUnit) {
    this.selectedUnit = item;
    this.selectedUnitChange.emit(item);
    this.inputControl.disable();
  }
  onClear() {
    this.selectedUnit = undefined;
    this.selectedUnitChange.emit(undefined);
    this.inputControl.reset();
    !this.disabled && this.inputControl.enable();
  }
}
