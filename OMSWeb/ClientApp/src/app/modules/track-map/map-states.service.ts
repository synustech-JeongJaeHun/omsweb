import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  IMapConfigChangeEvent,
  IMapToolbarCommandEvent,
  IMapToolbarToggleEvent,
} from '../../models/drawing.model';
import {
  CommandKeyType,
  ToggleOptionKeyType,
} from '../../models/enums';
import { ClientPreferences } from '../../models/settings.model';
import { SettingsService } from '../../services/settings.service';

@Injectable({
  providedIn: 'root',
})
export class MapStatesService {
  toolbarStates$ = new Subject<IMapToolbarToggleEvent>();
  toolbarCommandStates$ = new Subject<IMapToolbarCommandEvent>();
  configStates$ = new Subject<IMapConfigChangeEvent>();

  get preferences(): ClientPreferences {
    return this.settingSvc.globalPreferences;
  }

  constructor(private settingSvc: SettingsService) {}

  changeToolbarState(type: ToggleOptionKeyType, value: boolean) {
    const pref = this.preferences;
    pref.toggles[type] = value;
    pref.save();
    this.toolbarStates$.next({ type, value });
  }

  commandToolbar(type: CommandKeyType, value?: any) {
    this.toolbarCommandStates$.next({ type, value });
  }

  changeConfig(event: IMapConfigChangeEvent) {
    const pref = this.preferences;
    pref.map[event.type] = event.value;
    pref.save();
    this.configStates$.next(event);
  }
}
