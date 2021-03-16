import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  IMapToolbarCommandEvent,
  IMapToolbarToggleEvent,
} from '../../models/drawing.model';
import {
  MapToolbarCommandKeys,
  MapToolbarStatusKeys,
} from '../../models/enums';

@Injectable({
  providedIn: 'root',
})
export class MapStatesService {
  toolbarStates$ = new Subject<IMapToolbarToggleEvent>();
  toolbarCommandStates$ = new Subject<IMapToolbarCommandEvent>();
  constructor() {}

  changeToolbarState(type: MapToolbarStatusKeys, value: any) {
    // if (!Object.keys(this.changeToolbarState).includes(action)) return;
    this.toolbarStates$.next({ type, value });
  }

  commandToolbar(type: MapToolbarCommandKeys, value?: any) {
    this.toolbarCommandStates$.next({ type, value });
  }
}
