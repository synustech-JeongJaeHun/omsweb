import { LayoutUtil } from '../modules/shared/utils/layout.util';
import { ICoordinate } from './drawing.model';
import { Dto } from './dto/track.model';
import { IPoint } from './map.interface';
import { Point } from './point.model';
import { Segment } from './segment.model';

export class Buffer {
  objectType = 'Buffer';
  id: number;
  logicalId: string;
  physicalId: string;
  pointId?: any;

  coord: ICoordinate;
  invertedCoord: ICoordinate;
  direction: string;
  nextpoint?: number;
  offset?: number;
  unuse?: boolean;
  carrierId?: string;

  isValidate?: boolean;
  updateState?: string;
  group?: number;

  segmentDirection?: any;
  directionOffset?: any;

  constructor(
    row: Dto.IBuffer,
    isValidate: boolean,
    updateState: string,
    point: IPoint
  ) {
    const { id, logicalId, physicalId, pointId, group, direction, nextpoint, offset, unuse, carrierId } = row;
    this.id = id;
    this.logicalId = logicalId;
    this.physicalId = physicalId;
    this.pointId = pointId;
    this.direction = direction || 'U';
    this.nextpoint = nextpoint;
    this.offset = offset;
    this.unuse = unuse;
    this.carrierId = carrierId;
    this.group = group;

    this.isValidate = isValidate;
    this.updateState = updateState;

    this.coord = point.coord;
    this.invertedCoord = point.invertedCoord;
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
    let id,
      physicalId,
      logicalId,
      pointId,
      coord,
      invertedCoord,
      direction,
      nextpoint,
      offset,
      unuse,
      carrierId,
      group;
    let isValidate, updateState;

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
    nextpoint = this.nextpoint;
    offset = this.offset;
    unuse = this.unuse;
    carrierId = this.carrierId;

    isValidate = this.isValidate;
    updateState = this.updateState;
    group = this.group;

    // Object
    coord = { ...this.coord };
    invertedCoord = { ...this.invertedCoord };

    let copiedBuffer = new Buffer(
      { id, physicalId, logicalId, pointId, direction, group, nextpoint, offset, unuse, carrierId },
      isValidate,
      updateState,
      { coord, invertedCoord }
    );

    copiedBuffer.segmentDirection = this.segmentDirection;
    copiedBuffer.directionOffset = this.directionOffset;

    return copiedBuffer;
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
