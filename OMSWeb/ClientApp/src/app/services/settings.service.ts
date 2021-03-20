import { Injectable } from '@angular/core';
import { ClientPreferences } from '../models/settings.model';
import { StorageUtil } from '../modules/shared/utils/storage.util';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private _globalPreferences: ClientPreferences;

  get globalPreferences(): ClientPreferences {
    return this._globalPreferences;
  }

  constructor() {
    this.loadPreferences();
  }

  loadPreferences() {
    this._globalPreferences = new ClientPreferences('global.pref');
  }
}
