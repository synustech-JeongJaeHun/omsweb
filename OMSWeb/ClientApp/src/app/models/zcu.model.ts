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

  inputZones: any[];
  completePoints: string;

  constructor(row: Dto.IZcu, point: IPoint) {
    const { id, x, y, usingType, zcuType, inputZones, completePoints } = row;
    this.id = id;
    this.usingType = usingType;
    this.zcuType = zcuType;

    this.coord = point.coord;
    this.invertedCoord = point.invertedCoord;

    this.inputZones = inputZones;
    //if (inputZones.length) {
    //  for (let idx = 0; idx < inputZones.length; idx++) {
    //    if (idx == 0)
    //      this.inputZones += inputZones[idx].zonePoints;
    //    else
    //      this.inputZones += "," + inputZones[idx].zonePoints;
    //  }
    //}

    this.completePoints = "";
    if (completePoints.length) {
      for (let idx = 0; idx < completePoints.length; idx++) {
        if (idx == 0)
          this.completePoints += completePoints[idx].completePointId;
        else
          this.completePoints += "," + completePoints[idx].completePointId;
      }
    }
  }
}
