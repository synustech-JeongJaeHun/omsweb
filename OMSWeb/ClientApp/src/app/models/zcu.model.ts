import { ICoordinate } from './drawing.model';
import { Dto } from './dto/track.model';
import { IPoint } from './map.interface';

export class Zcu {
  objectType = 'ZCU';
  id: number;
  // x: number;
  // y: number;
  usingType: number;
  zcuType: number;

  coord: ICoordinate;
  invertedCoord: ICoordinate;

  constructor(row: Dto.IZcu, point: IPoint) {
    const {id, x, y, usingType, zcuType} = row;
    this.id = id;
    this.usingType = usingType;
    this.zcuType = zcuType;

    this.coord = point.coord;
    this.invertedCoord = point.invertedCoord;
  }
}
