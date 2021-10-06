import { ToggleOptionKeyType } from './enums';
import { StorageUtil } from '@oms/utils/storage.util';
import { main_css } from '../modules/shared/utils/css-loader';
import { IZoom } from './drawing.model';

export type ToggleOptionsType = {
  [key in ToggleOptionKeyType]: boolean;
};

export class ServiceConfig {
  sid: string;
  allowPublicMonitor = false;
  version: string;
  kpiEnabled: boolean;
}

export class MapConfig {
  vehicleScale?: number = main_css.vehicle.radius;
  mapRotation?: number = 0;
  segmentWidth?: number = 2;
  segmentDirectionSize? = 5;
}

export class ThemeConfig {
  // playbackBackground?: any;
  [key: string]: any;
}

export interface IPreferences {
  toggles: ToggleOptionsType;
  map: MapConfig;
  uiStates?: UiStates;
  theme?: ThemeConfig;
}

export class UiStates {
  controlTab?: number = 0;
  zoom?: IZoom;
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
  zcus: true,
  mtls: true,
  vehicles: true,
  clusters: true,
  overlaps: false,
  itemDetails: false,
  showToolName: false,
  showOmsVersion: true,
  showKpi: true,
};

export class ClientPreferences implements IPreferences {
  toggles: ToggleOptionsType;
  map: MapConfig;
  uiStates?: UiStates;
  theme?: ThemeConfig;

  constructor(private storeKey: string, private base?: IPreferences) {
    this.load();
  }

  getServiceConfig() {}

  private load() {
    const value = StorageUtil.getLocal(this.storeKey) || '{}';
    const {
      toggles = {},
      map = {},
      uiStates = {},
      theme = {},
    } = JSON.parse(value);
    const { toggles: baseToggle = {}, map: baseMap = {} } = this.base || {};
    this.toggles = { ...defaultToggleOptions, ...baseToggle, ...toggles };
    this.map = { ...new MapConfig(), ...baseMap, ...map };
    this.uiStates = { ...new UiStates(), ...uiStates };
    this.theme = { ...new ThemeConfig(), ...theme };
  }

  save() {
    const pref: IPreferences = {
      toggles: { ...this.toggles },
      map: { ...this.map },
      uiStates: { ...this.uiStates },
      theme: { ...this.theme },
    };
    StorageUtil.setLocal(this.storeKey, JSON.stringify(pref));
  }
}

export interface ISettingsSegment {
  id: number;
  physicalId: string;
  logicalId: string;
  startPoint: number;
  endPoint: number;
  speed: number;
  length: number;
}
export interface ISettingsSegmentWithVParts extends ISettingsSegment {
  steerDir: number;
  speedRatio: number;
  obLow: string;
  obHigh: string;
  obDistance: string;
}
export interface ISettingsSegmentWithVPartsNBlocking extends ISettingsSegmentWithVParts {
  blockingId: number;
  segmentId?: number;
  disabledBy: string;
  reason: string;
  unUse: boolean;
}

export interface ISettingsStationWithUnuse {
  id: number;
  physicalId: string;
  logicalId: string;
  point: number;
  direction: string;
  carrierType?: number;
  nextpoint: number;
  offset: number;
  unUse: boolean;
}

export interface ISettingsBufferWithUnuse {
  id: number;
  physicalId: string;
  logicalId: string;
  point: number;
  direction: string;
  nextpoint: number;
  offset: number;
  unUse: boolean;
}

export interface ISettingsZcu {
  id: number;
  x: number;
  y: number;
  usingType: number;
  zcuType: number;
}

export interface ISettingsVehicleReg {
  id: string;
  logicalId: string;
  isNew?: boolean;
}

export interface IVehicleRegForm {
  id: string;
  logicalId: string;
}

export interface ISettingsGroup {
  id: number;
  objects?: any[];
}

export interface ISettingsGroupedObject {
  id: number;
  groupId: number;
  referenceId: number;
  referenceTable: string;
}

export interface ISettingsObject {
  id: number;
}

export interface ISettingsCluster {
  id: number;
  logicalId: string;
  maxVehicles: number;
  color?: string;
}

export interface ISettingsClusterPoint {
  id: number;
  pointId: number;
  clusterId: number;
}
