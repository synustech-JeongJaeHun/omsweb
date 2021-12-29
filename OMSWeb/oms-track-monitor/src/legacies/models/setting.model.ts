import { ToggleOptionKeyType } from '../Enums';
import { main_css } from '../css-loader';
import { IZoom } from './drawing.model';

type ToggleOptionsType = {
  [key in ToggleOptionKeyType]: boolean;
};

class ServiceConfig {
  // @ts-ignore
  sid: string;
  allowPublicMonitor = false;
  // @ts-ignore
  version: string;
  // @ts-ignore
  kpiEnabled: boolean;
}

class MapConfig {
  vehicleScale?: number = main_css.vehicle.radius;
  mapRotation?: number = 0;
  segmentWidth?: number = 2;
  segmentDirectionSize?= 5;
}

class ThemeConfig {
  // playbackBackground?: any;
  [key: string]: any;
}

interface IPreferences {
  toggles: ToggleOptionsType;
  map: MapConfig;
  uiStates?: UiStates;
  theme?: ThemeConfig;
  controlTables?: ControlTable;
}

class UiStates {
  controlTab?: number = 0;
  zoom?: IZoom;
}

const defaultToggleOptions: ToggleOptionsType = {
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

class ControlTable {
  [key: string]: boolean;
};

const defaultControlTable: ControlTable = {
  "orders": true,
  "orders_id": true,
  "orders_logicalId": true,
  "orders_state": true,
  "orders_vehicleId": true,
  "orders_locationPickup": true,
  "orders_locationDropoff": true,
  "orders_locationMove": true,
  "orders_priority": true,
  "orders_carrierLabel": true,
  "orders_timeCreated": true,
  "orders_timeAssigned": true,
  "orders_origin": true,
  "orders_durationTotal": true,
  "orders_durationUnassigned": true,
  "orders_durationPickup": true,
  "orders_durationLoad": true,
  "orders_durationDropoff": true,
  "orders_durationUnload": true,
  "orders_durationMove": true,
  "orders_distancePickup": true,
  "orders_distanceDropoff": true,
  "orders_distanceMove": true,
  "orders_lastReassignType": true,

  "vehicles": true,
  "vehicles_id": true,
  "vehicles_physicalId": true,
  "vehicles_logicalId": true,
  "vehicles_mode": true,
  "vehicles_canBePushed": true,
  "vehicles_railIn": true,
  "vehicles_hostOrder": true,
  "vehicles_orderOrigin": true,
  "vehicles_group": true,
  "vehicles_curPoint": true,
  "vehicles_commandPoint": true,
  "vehicles_orderId": true,
  "vehicles_locationPickup": true,
  "vehicles_locationDropoff": true,
  "vehicles_locationMove": true,
  "vehicles_runtimeTotal": true,
  "vehicles_movingState": true,
  "vehicles_cargoState": true,
  "vehicles_error": true,
  "vehicles_sensorStopped": true,
  "vehicles_blocked": true,
  "vehicles_distanceTotal": true,
  "vehicles_mapDb": true,

  "stations": true,
  "stations_id": true,
  "stations_physicalId": true,
  "stations_logicalId": true,
  "stations_group": true,
  "stations_point": true,
  "stations_direction": true,
  "stations_carrierType": true,
  "stations_nextPoint": true,
  "stations_offset": true,

  "buffers": true,
  "buffers_id": true,
  "buffers_physicalId": true,
  "buffers_logicalId": true,
  "buffers_group": true,
  "buffers_point": true,
  "buffers_direction": true,
  "buffers_nextPoint": true,
  "buffers_offset": true
}

class ClientPreferences implements IPreferences {
  // @ts-ignore
  toggles: ToggleOptionsType;
  // @ts-ignore
  map: MapConfig;
  uiStates?: UiStates;
  theme?: ThemeConfig;
  controlTables?: ControlTable;

  constructor(private storeKey: string, private base?: IPreferences) {
    this.load();
  }

  getServiceConfig() { }

  private load() {
    const getLocal = (key: string): string | null => {
      if (!key) {
        return null;
      }
      return localStorage.getItem(key);
    };

    const value = getLocal(this.storeKey) || '{}';
    const {
      toggles = {},
      map = {},
      uiStates = {},
      theme = {},
      controlTables = {},
    } = JSON.parse(value);
    const { toggles: baseToggle = {}, map: baseMap = {}, controlTables: baseControlTable = {} } = this.base || {};
    this.toggles = { ...defaultToggleOptions, ...baseToggle, ...toggles };
    this.map = { ...new MapConfig(), ...baseMap, ...map };
    this.uiStates = { ...new UiStates(), ...uiStates };
    this.theme = { ...new ThemeConfig(), ...theme };
    this.controlTables = { ...defaultControlTable, ...baseControlTable, ...controlTables };
  }

  save() {
    const pref: IPreferences = {
      toggles: { ...this.toggles },
      map: { ...this.map },
      uiStates: { ...this.uiStates },
      theme: { ...this.theme },
      controlTables: { ...this.controlTables },
    };
    const setLocal = (key: string, value: string) => {
      if (!key) {
        return;
      }
      localStorage.setItem(key, value);
    };
    setLocal(this.storeKey, JSON.stringify(pref));
  }
}

interface ISettingsSegment {
  id: number;
  physicalId: string;
  logicalId: string;
  startPoint: number;
  endPoint: number;
  speed: number;
  length: number;
}
interface ISettingsSegmentWithVParts extends ISettingsSegment {
  steerDir: number;
  speedRatio: number;
  obLow: string;
  obHigh: string;
  obDistance: string;
}
interface ISettingsSegmentWithVPartsNBlocking extends ISettingsSegmentWithVParts {
  blockingId: number;
  segmentId?: number;
  disabledBy: string;
  reason: string;
  unUse: boolean;
}

interface ISettingsStationWithUnuse {
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

interface ISettingsBufferWithUnuse {
  id: number;
  physicalId: string;
  logicalId: string;
  point: number;
  direction: string;
  nextpoint: number;
  offset: number;
  unUse: boolean;
}

interface ISettingsZcu {
  id: number;
  x: number;
  y: number;
  usingType: number;
  zcuType: number;
  completePoints: string;
  inputZones: ISettingsZcuInputZone[];
}

interface ISettingsZcuInputZone {
  id: number;
  zcuId: number;
  priorityPoint: number;
  zonePoints: string;
}

interface ISettingsVehicleReg {
  id: string;
  logicalId: string;
  isNew?: boolean;
}

interface IVehicleRegForm {
  id: string;
  logicalId: string;
}

interface ISettingsGroup {
  id: number;
  objects?: any[];
  homePoints?: any[];
  stations?: any[];
  vehicles?: any[];
  buffers?: any[];
}

interface ISettingsGroupedObject {
  id: number;
  groupId: number;
  referenceId: number;
  referenceTable: string;
}

interface ISettingsCluster {
  id: number;
  logicalId: string;
  maxVehicles: number;
  color?: string;
}

interface ISettingsClusterPoint {
  id: number;
  pointId: number;
  clusterId: number;
}

export { IPreferences, UiStates }