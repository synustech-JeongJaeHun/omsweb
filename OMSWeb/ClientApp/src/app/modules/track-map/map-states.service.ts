import { EventEmitter, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
  IMapConfigChangeEvent,
  IMapToolbarCommandEvent,
  IMapToolbarToggleEvent,
} from '../../models/drawing.model';
import { CommandKeyType, ToggleOptionKeyType } from '../../models/enums';
import {
  IMapMouseEvent,
  TransferCommandState,
} from '../../models/map.interface';
import { ClientPreferences } from '../../models/settings.model';
import { SettingsService } from '../../services/settings.service';

@Injectable({
  providedIn: 'root',
})
export class MapStatesService {
  toolbarToggleEvent$ = new Subject<IMapToolbarToggleEvent>();
  toolbarCommandEvent$ = new Subject<IMapToolbarCommandEvent>();
  configChangeEvent$ = new Subject<IMapConfigChangeEvent>();
  actionState$ = new EventEmitter<IMapMouseEvent>();
  // transferCommandState$ = new Subject<TransferCommandState>();

  private _transferCommandState: TransferCommandState;

  get preferences(): ClientPreferences {
    return this.settingSvc.globalPreferences;
  }
  get transferCommandState(): TransferCommandState {
    return this._transferCommandState;
  }

  constructor(private settingSvc: SettingsService) {
    this.resetTransferCommandState();
  }

  resetTransferCommandState() {
    this._transferCommandState = new TransferCommandState();
  }

  changeToolbarState(type: ToggleOptionKeyType, value: boolean) {
    const pref = this.preferences;
    pref.toggles[type] = value;
    pref.save();
    this.toolbarToggleEvent$.next({ type, value });
  }

  commandToolbar(type: CommandKeyType, value?: any) {
    this.toolbarCommandEvent$.next({ type, value });
  }

  changeConfig(event: IMapConfigChangeEvent) {
    const pref = this.preferences;
    pref.map[event.type] = event.value;
    pref.save();
    this.configChangeEvent$.next(event);
  }
}
