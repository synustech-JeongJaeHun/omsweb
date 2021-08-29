import { LayoutUtil } from '../modules/shared/utils/layout.util';
import { ICoordinate } from './drawing.model';
import { Dto } from './dto/track.model';
import { IPoint } from './map.interface';
import { Point } from './point.model';
import { Segment } from './segment.model';

export class Station {
  objectType = 'Station';
  id: number;
  logicalId: string;
  physicalId: string;
  pointId: number;
  coord: ICoordinate;
  invertedCoord: ICoordinate;
  direction: string;
  carrierType: string;
  nextpoint: number;
  offset?: number;

  isValidate?: boolean;
  updateState?: string;
  group?: number;

  segmentDirection?: any;
  directionOffset?: any;

  constructor(
    row: Dto.IStation,
    isValidate: boolean,
    updateState: string,
    point: IPoint
  ) {
    const {
      id,
      logicalId,
      physicalId,
      pointId,
      direction,
      carrierType,
      nextpoint,
      offset,
      group,      
    } = row;
    this.id = id;
    this.logicalId = logicalId;
    this.physicalId = physicalId;
    this.pointId = pointId;
    this.direction = direction || 'U';
    this.carrierType = carrierType;
    this.nextpoint = nextpoint;
    this.offset = offset;
    this.group = group;    

    this.coord = point.coord;
    this.invertedCoord = point.invertedCoord;
    this.isValidate = isValidate;
    this.updateState = updateState;
  }

  set_direction_attr(segments: Segment[]) {
    this.segmentDirection = LayoutUtil.find_location_object_direction_at_point(
      this.pointId,
      segments
    ); // returns inverted 'T' and 'B' due to map inversion
    this.directionOffset = LayoutUtil.get_location_object_direction_offset(
      this.direction,
      this.segmentDirection,
      this.objectType
    );
  }

  copy(newId) {
    let {
      id,
      physicalId,
      logicalId,
      pointId,
      coord,
      invertedCoord,
      direction,
      carrierType,
      nextpoint,
      offset,
      group,      
      isValidate,
      updateState,
    } = this;

    // Replace ID
    if (newId === null || newId === undefined) {
      id = this.id;
    } else {
      id = newId;
    }

    physicalId = this.physicalId;
    logicalId = this.logicalId;
    pointId = this.pointId;
    direction = this.direction;
    carrierType = this.carrierType;
    nextpoint = this.nextpoint,
    offset = this.offset;

    isValidate = this.isValidate;
    updateState = this.updateState;
    group = this.group;
    
    // Object
    coord = { ...this.coord };
    invertedCoord = { ...this.invertedCoord };

    let copied_station = new Station(
      { id, physicalId, logicalId, pointId, direction, carrierType, nextpoint, offset, group },
      isValidate,
      updateState,
      { coord, invertedCoord }
    );

    copied_station.segmentDirection = this.segmentDirection;
    copied_station.directionOffset = this.directionOffset;

    return copied_station;
  }

  apply_offset(offset, snapDist, invertFactorY) {
    this.coord.x += offset.x;
    this.coord.y += offset.y;

    // Snap original coord
    this.coord = LayoutUtil.calc_snap_coord(this.coord, snapDist);

    this.invertedCoord.x = this.coord.x;
    this.invertedCoord.y = invertFactorY - this.coord.y;
  }
}
