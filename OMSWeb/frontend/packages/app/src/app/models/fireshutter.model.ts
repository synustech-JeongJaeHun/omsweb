import { ICoordinate } from './drawing.model';
import { Dto } from './dto/track.model';
import { IPoint } from './map.interface';

export class FireShutter {
  objectType = 'FireShutter';
  id: number;
  // x: number;
  // y: number;
  logicalId: string;
  segments: string;
  status: number;

  coord: ICoordinate;
  invertedCoord: ICoordinate;

  constructor(row: Dto.IFireShutter, point: IPoint) {
    const { id, x, y, logicalId, segments, status } = row;
    this.id = id;
    this.logicalId = logicalId;
    this.segments = segments;
    this.status = status;

    this.coord = point.coord;
    this.invertedCoord = point.invertedCoord;

  }
}
