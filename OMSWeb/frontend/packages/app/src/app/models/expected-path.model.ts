import { ISegmentPath } from './map.interface';

export class ExpectedPath {
  objectType: 'ExpectedPath';
  id: number;
  pointList: number[];
  pathSegments: ISegmentPath[];

  constructor(id: number, pointList: number[], pathSegments: ISegmentPath[]) {
    this.id = id;
    this.pointList = pointList;
    this.pathSegments = pathSegments;
  }
}
