import { ICoordinate } from './drawing.model';
import { ICoordinateInfo } from './map.interface';
import { Dto } from './dto/track.model';
import { IPoint } from './map.interface';

export class Point implements IPoint {
  objectType = 'Point';
  id?: number;
  logicalId?: string;
  physicalId?: string;
  coord: ICoordinate;
  invertedCoord: ICoordinate;
  isValidate?: boolean;
  validateText?: string;
  updateState?: string;
  group?: number;
  isHome?: boolean;

  constructor(
    row: Dto.IPoint,
    coordInfo: ICoordinateInfo,
    isValid: boolean,
    updateState: string
  ) {
    this.id = row.id;
    this.logicalId = row.logicalId;
    this.physicalId = row.physicalId;
    this.coord = coordInfo.coord;
    this.invertedCoord = coordInfo.invertedCoord;
    this.isValidate = isValid;
    this.updateState = updateState;
    this.group = row.group;
  }

  apply_offset(offset, snapDist, invertFactorY) {
    this.coord.x += offset.x;
    this.coord.y += offset.y;

    // Snap original coord
    // this.coord = Util.layout.calc_snap_coord(this.coord, snapDist)

    this.invertedCoord.x = this.coord.x;
    this.invertedCoord.y = invertFactorY - this.coord.y;
  }

  copy(newId) {
    let id,
      physicalId,
      logicalId,
      coord,
      invertedCoord,
      isValidate,
      updateState,
      validateText;

    // Replace ID
    if (newId === null || newId === undefined) {
      id = this.id;
    } else {
      id = newId;
    }

    physicalId = this.physicalId;
    logicalId = this.logicalId;

    isValidate = this.isValidate;
    updateState = this.updateState;

    // Object
    coord = { ...this.coord };
    invertedCoord = { ...this.invertedCoord };

    let copied_point = new Point(
      {
        id,
        physicalId,
        logicalId,
      },
      {
        coord,
        invertedCoord,
      },
      isValidate,
      updateState
    );
    copied_point.validateText = this.validateText;

    return copied_point;
  }
}
