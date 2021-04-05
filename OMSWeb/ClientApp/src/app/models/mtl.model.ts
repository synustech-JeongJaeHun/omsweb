import { LayoutUtil } from '../modules/shared/utils/layout.util';
import { ICoordinate } from './drawing.model';
import { Dto } from './dto/track.model';
import { IPoint } from './map.interface';
import { Point } from './point.model';

export class MTL {
  objectType = 'MTL';
  id: number;
  logicalId: string;
  physicalId: string;
  pointId?: any;

  coord: ICoordinate;
  invertedCoord: ICoordinate;

  inUse?: boolean;
  position?: any;
  mode?: any;
  errorList?: any;

  isValidate?: boolean;
  updateState?: string;
  group?: number;

  constructor(
    row: Dto.IMTL,
    isValidate: boolean,
    updateState: string,
    point: IPoint
  ) {
    const {
      id,
      logicalId,
      physicalId,
      pointId,
      group,
      position,
      inUse,
      mode,
      errorList,
    } = row;
    this.id = id;
    this.logicalId = logicalId;
    this.physicalId = physicalId;
    this.pointId = pointId;
    this.group = group;

    this.isValidate = isValidate;
    this.updateState = updateState;

    this.coord = point.coord;
    this.invertedCoord = point.invertedCoord;

    this.position = position;
    this.inUse = inUse;
    this.mode = mode;
    this.errorList = errorList;
  }

  copy(newId) {
    let {
      id,
      physicalId,
      logicalId,
      pointId,
      coord,
      invertedCoord,
      inUse,
      position,
      mode,
      errorList,
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
    inUse = this.inUse;
    position = this.position;
    mode = this.mode;
    errorList = this.errorList;

    isValidate = this.isValidate;
    updateState = this.updateState;

    // Object
    coord = { ...this.coord };
    invertedCoord = { ...this.invertedCoord };
    group = this.group;

    let copied_mtl = new MTL(
      {
        id,
        physicalId,
        logicalId,
        pointId,
        inUse,
        position,
        mode,
        errorList,
        group,
      },
      isValidate,
      updateState,
      { coord, invertedCoord }
    );

    return copied_mtl;
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
