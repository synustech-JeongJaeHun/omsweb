import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';
import { VehicleDestinationType } from '../../../models/map.interface';
import { TrackIdService } from '../../../services/track-id.service';

@Component({
  selector: 'oms-dest-command',
  templateUrl: './dest-command.component.html',
  styles: [
    `
      mat-form-field {
        font-size: 12px;
        max-width: 180px;
      }
      mat-form-field ::ng-deep.mat-form-field-wrapper {
        margin-bottom: -10px;
      }
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
export class DestCommandComponent implements OnInit {
  @Input() scope: VehicleDestinationType;

  inputControl = new FormControl();
  targetOptions$: Observable<any[]>;

  commandDestTarget: any;

  private _searchScopes: string[] = [];

  constructor(private idSvc: TrackIdService) {}

  ngOnInit(): void {
    this._searchScopes =
      this.scope === 'go'
        ? ['points', 'stations', 'buffers']
        : ['stations', 'buffers'];

    this.targetOptions$ = this.inputControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((value) =>
        this.idSvc.lookupUnits(this._searchScopes, value)
      ),
    );
  }

  displayTargetFn(item: any): string | undefined {
    if (!item) return;
    return `${item.objectType} #${item.id}`;
  }
  onTargetSelected(item: any) {
    this.commandDestTarget = item;
    this.inputControl.disable();
  }
  onTargetClear() {
    this.commandDestTarget = undefined;
    this.targetOptions$ = of([]);
    this.inputControl.reset();
    this.inputControl.enable();
  }

  trigger() {
    // @TODO send message
    console.warn('## TODO : send vehicle dest trigger message');
  }
}
