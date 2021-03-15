import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MapToolbarStatusKeys } from '../../models/enums';

@Injectable({
  providedIn: 'root',
})
export class MapStatesService {
  toolbarStates$: { [key in MapToolbarStatusKeys]: Subject<boolean> } = {
    minimap: new Subject<boolean>(),
    controlTable: new Subject<boolean>(),
    expectedPaths: new Subject<boolean>(),
    vehicleLines: new Subject<boolean>(),
    pointLabels: new Subject<boolean>(),
    segmentDirections: new Subject<boolean>(),
    stations: new Subject<boolean>(),
    buffers: new Subject<boolean>(),
    groups: new Subject<boolean>(),
    clusters: new Subject<boolean>(),
    overlaps: new Subject<boolean>(),
  };
  constructor() {}

  changeToolbarState(action: MapToolbarStatusKeys, value: any) {
    // if (!Object.keys(this.changeToolbarState).includes(action)) return;
    this.toolbarStates$[action].next(value);
  }
}
