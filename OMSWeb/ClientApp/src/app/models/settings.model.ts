import { ToggleOptionKeyType } from './enums';
import { StorageUtil } from '@oms/utils/storage.util';
import { main_css } from '../modules/shared/utils/css-loader';

export type ToggleOptionsType = {
  [key in ToggleOptionKeyType]: boolean;
};

export class MapConfig {
  vehicleScale?: number = main_css.vehicle.radius;
  mapRotation?: number = 0;
  segmentWidth?: number = 2;
}

export interface IPreferences {
  toggles: ToggleOptionsType;
  map: MapConfig;
  uiStates?: UiStates;
}

export class UiStates {
  controlTab?: number = 0;
}

export const defaultToggleOptions: ToggleOptionsType = {
  minimap: true,
  controlTable: false,
  expectedPaths: false,
  vehicleLines: false,
  pointLabels: false,
  segmentDirections: true,
  stations: true,
  buffers: false,
  groups: true,
  mtls: true,
  vehicles: true,
  clusters: true,
  overlaps: false,
  itemDetails: false,
};

export class ClientPreferences implements IPreferences {
  toggles: ToggleOptionsType;
  map: MapConfig;
  uiStates?: UiStates;

  constructor(private storeKey: string, private base?: IPreferences) {
    this.load();
  }

  private load() {
    const value = StorageUtil.getLocal(this.storeKey) || '{}';
    const { toggles = {}, map = {}, uiStates = {} } = JSON.parse(value);
    const { toggles: baseToggle = {}, map: baseMap = {} } = this.base || {};
    this.toggles = { ...defaultToggleOptions, ...baseToggle, ...toggles };
    this.map = { ...new MapConfig(), ...baseMap, ...map };
    this.uiStates = { ...new UiStates(), ...uiStates };
  }

  save() {
    const pref: IPreferences = {
      toggles: { ...this.toggles },
      map: { ...this.map },
      uiStates: { ...this.uiStates },
    };
    StorageUtil.setLocal(this.storeKey, JSON.stringify(pref));
  }
}
