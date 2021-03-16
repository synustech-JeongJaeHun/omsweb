import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IMapToolbarToggleEvent } from '../../models/drawing.model';
import { MapToolbarStatusKeys } from '../../models/enums';

@Injectable({
  providedIn: 'root',
})
export class MapStatesService {
  toolbarStates$ = new Subject<IMapToolbarToggleEvent>();
  constructor() {}

  changeToolbarState(type: MapToolbarStatusKeys, value: any) {
    // if (!Object.keys(this.changeToolbarState).includes(action)) return;
    this.toolbarStates$.next({ type, value });
  }
}
