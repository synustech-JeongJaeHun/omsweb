import { ToggleOptionKeyType } from './enums';
import { StorageUtil } from '@oms/utils/storage.util';

export type ToggleOptionsType = {
  [key in ToggleOptionKeyType]: boolean;
};

export interface IPreferences {
  toggles: ToggleOptionsType;
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
};

export class ClientPreferences implements IPreferences {
  toggles: ToggleOptionsType;

  constructor(private storeKey: string, private base?: IPreferences) {
    this.load();
  }

  load() {
    const value = StorageUtil.getLocal(this.storeKey) || '{}';
    const { toggles = {} } = JSON.parse(value);
    const { toggles: baseToggle = {} } = this.base || {};
    this.toggles = { ...defaultToggleOptions, ...baseToggle, ...toggles };
  }

  save() {
    const pref: IPreferences = {
      toggles: { ...this.toggles },
    };
    StorageUtil.setLocal(this.storeKey, JSON.stringify(pref));
  }
}
