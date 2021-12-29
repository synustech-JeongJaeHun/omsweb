// import { Group } from './group.model';
// import { Point } from './point.model';
// import { Segment } from './segment.model';
// import { Vehicle } from './vehicle.model';
// import { Station } from './station.model';
// import { MTL } from './mtl.model';
// import { Cluster } from './cluster.model';
// import { Buffer } from './buffer.model';
// import { Zcu } from './zcu.model';
import { ICoordinate } from './models/drawing.model';

// interface IViewerData {
//   groups?: Group[];
//   points?: Point[];
//   segments?: Segment[];
//   segmentsDisabled?: any[];
//   stations?: Station[];
//   buffers?: Buffer[];
//   mtls?: MTL[];
//   clusters?: Cluster[];
//   vehicles?: Vehicle[];
//   zcus?: Zcu[];
// }
interface ICoordinateInfo {
  coord: ICoordinate;
  invertedCoord?: ICoordinate;
  isError?: boolean;
}
interface ISegmentSummary {
  type: string;
  location: string;
  direction: string;
}
interface ISegmentPart {
  id?: number;
  radius?: number;
  type?: string;
  direction?: string;
  location?: string;
  coordFrom: ICoordinateInfo;
  coordTo: ICoordinateInfo;
  path?: string;
}

interface ISegmentPath {
  id: number;
  path: string;
  pointFrom: IPoint;
  pointTo: IPoint;
  type: string;
}
interface ISegment extends ISegmentPath {
  logicalId: string;
  physicalId: string;
  location: string;
  direction: string;

  segmentParts: ISegmentPart[];
  dirCoord: any;
  dirAngle: any;
  bezierPoints: any[];

  length: number;
  speed?: number;
  travelTime?: number;

  disableState?: any;

  candidates?: any[];
  isValidate?: boolean;
  validateText?: string;
  updateState?: string;
}

interface IPoint {
  id?: number;
  coord: ICoordinate;
  invertedCoord: ICoordinate;
}

type VehicleDestinationType = 'go' | 'load' | 'unload';

type MapEventType =
  | 'click'
  | 'contextmenu'
  | 'mouseenter'
  | 'mouseout'
  | 'backdrop'
  | 'selectUnit';
interface IMapMouseEvent {
  type: MapEventType;
  targetId?: number;
  targetType?: string;
  targetData?: any;
  mapMode?: string;
  groupType?: string; //'OVERLAP' | 'OVERLAP_MODULE' | 'UNASSIGNED_MODULE' | 'LAYOUT';
  position?: ICoordinate;
}

type TransferCommandCategoryType = 'fromTo' | 'from' | 'to' | 'move';

class TransferCommandState {
  active: boolean = false;
  category: TransferCommandCategoryType = 'fromTo';
  auto: boolean = true;
  vehicle?: ILookupUnit;
  point?: ILookupUnit;
  source?: ILookupUnit;
  dest?: ILookupUnit;
  carrier?: string;

  get autoDisabled(): boolean {
    return !this.active || ['fromTo', 'from'].includes(this.category);
  }
  get vehicleDisabled(): boolean {
    return (
      !this.active || (this.auto && ['fromTo', 'from'].includes(this.category))
    );
  }
  get pointDisabled(): boolean {
    return !this.active || ['fromTo', 'from', 'to'].includes(this.category);
  }
  get sourceDisabled(): boolean {
    return !this.active || ['to', 'move'].includes(this.category);
  }
  get destDisabled(): boolean {
    return !this.active || ['from'].includes(this.category);
  }
  get carrierDisabled(): boolean {
    return !this.active || !this.pointDisabled;
  }
}

interface ILookupUnit {
  id?: number;
  objectType?: string;
  logicalId?: string;
  physicalId?: string;
}

type TrackIdMapType = { [key: string]: ILookupUnit };

class VehicleTrackingState {
  status: boolean = false;
  id?: number;
}

export { ISegmentSummary, ISegmentPart, ISegment, IPoint }