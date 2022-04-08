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
import { TrackStatusService } from '@oms/root/services/track-status.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ILookupUnit } from '../../../models/map.interface';

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

  constructor(private trackStatusService: TrackStatusService) {}
  ngOnChanges(changes: SimpleChanges): void {
    const { disabled, selectedUnit } = changes;
    if (disabled) {
      disabled.currentValue
        ? this.inputControl.disable()
        : this.inputControl.enable();
    }

    if (selectedUnit) {
      selectedUnit.currentValue &&
        this.inputControl.setValue(selectedUnit.currentValue);
    }
  }

  ngOnInit(): void {
    this.targetOptions$ = this.inputControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      // switchMap((value) => this.idSvc.lookupUnitsByLogicalId(this.findScopes, value))
      switchMap((value) => {
        const result: ILookupUnit[] = [];
        if (this.findScopes.includes('vehicles')) {
          result.push(
            ...this.trackStatusService.trackData.vehicles
              .filter((v) => v.logicalId.includes(value))
              .map((v) => ({
                id: v.id,
                objectType: 'Vehicle',
                logicalId: v.logicalId,
                physicalId: v.physicalId,
              }))
          );
        }
        if (this.findScopes.includes('points')) {
          result.push(
            ...this.trackStatusService.trackData.points
              .filter((p) => p.logicalId.includes(value))
              .map((p) => ({
                id: p.id,
                objectType: 'Point',
                logicalId: p.logicalId,
                physicalId: p.physicalId,
              }))
          );
        }
        if (this.findScopes.includes('stations')) {
          result.push(
            ...this.trackStatusService.trackData.stations
              .filter((s) => s.logicalId.includes(value))
              .map((s) => ({
                id: s.id,
                objectType: 'Station',
                logicalId: s.logicalId,
                physicalId: s.physicalId,
              }))
          );
        }
        if (this.findScopes.includes('buffers')) {
          result.push(
            ...this.trackStatusService.trackData.buffers
              .filter((b) => b.logicalId.includes(value))
              .map((b) => ({
                id: b.id,
                objectType: 'Buffer',
                logicalId: b.logicalId,
                physicalId: b.physicalId,
              }))
          );
        }

        if (this.findScopes.includes('mtls')) {
          result.push(
            ...this.trackStatusService.trackData.mtls
              .filter((m) => m.logicalId.includes(value))
              .map((m) => ({
                id: m.id,
                objectType: 'Mtl',
                logicalId: m.logicalId,
                physicalId: m.physicalId,
              }))
          );
        }

        return of(result);
      })
    );

    if (this.selectedUnit) this.inputControl.disable();
  }
  displayFn(item: ILookupUnit): string | undefined {
    if (!item) return;
    return `${item.objectType} #${item.logicalId}`;
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
