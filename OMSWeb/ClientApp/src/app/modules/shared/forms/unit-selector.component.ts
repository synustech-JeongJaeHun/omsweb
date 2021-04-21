import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { data } from 'jquery';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ILookupUnit } from '../../../models/map.interface';
import { MapDataService } from '../../track-map/map-data.service';

@Component({
  selector: 'oms-unit-selector',
  templateUrl: './unit-selector.component.html',
  styles: [
    `
      mat-option {
        font-size: 12px;
      }
      .option-type {
        font-weight: bold;
        color: #999;
        padding-left: 30px;
      }
    `,
  ],
})
export class UnitSelectorComponent implements OnInit, OnChanges {
  @Input() findScopes: string[] = ['points', 'stations', 'buffers'];
  @Input() disabled: boolean = false;
  @Input() selectedUnit: ILookupUnit;
  @Input() placeholder: string;
  @Output() selectedUnitChange = new EventEmitter<ILookupUnit>();

  inputControl = new FormControl();
  targetOptions$: Observable<ILookupUnit[]>;

  constructor(private dataSvc: MapDataService) {}
  ngOnChanges(changes: SimpleChanges): void {
    const { disabled, selectedUnit } = changes;
    if (disabled) {
      disabled.currentValue
        ? this.inputControl.disable()
        : this.inputControl.enable();
    }

    if (selectedUnit) {
      selectedUnit.currentValue && this.inputControl.setValue(selectedUnit.currentValue);
    }
  }

  ngOnInit(): void {
    this.targetOptions$ = this.inputControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) => this.dataSvc.lookupUnits(this.findScopes, value))
      // mergeMap((list) => of(list))
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
    this.targetOptions$ = of([]);
    this.inputControl.reset();
    !this.disabled && this.inputControl.enable();
  }
}
