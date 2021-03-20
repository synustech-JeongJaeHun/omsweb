import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  IMapToolbarCommandEvent,
  IMapToolbarToggleEvent,
} from '../../models/drawing.model';
import {
  CommandKeyType,
  ToggleOptionKeyType,
} from '../../models/enums';
import { SettingsService } from '../../services/settings.service';

@Injectable({
  providedIn: 'root',
})
export class MapStatesService {
  toolbarStates$ = new Subject<IMapToolbarToggleEvent>();
  toolbarCommandStates$ = new Subject<IMapToolbarCommandEvent>();
  constructor(private settingSvc: SettingsService) {}

  changeToolbarState(type: ToggleOptionKeyType, value: boolean) {
    const pref = this.settingSvc.globalPreferences;
    pref.toggles[type] = value;
    pref.save();
    this.toolbarStates$.next({ type, value });
  }

  commandToolbar(type: CommandKeyType, value?: any) {
    this.toolbarCommandStates$.next({ type, value });
  }
}
