import * as _ from 'lodash';
import { ICoordinate } from './drawing.model';
import { Dto } from './dto/track.model';
import { Point } from './point.model';
import { IPoint, ISegment, ISegmentPart, ISegmentSummary } from './map.interface';
import { LayoutUtil } from '../modules/shared/utils/layout.util';
import { defaultSegmentGeometries } from './map-constants';
// import { MapParser } from '../modules/shared/viewers/map-parser';

export class Segment implements ISegment {
  objectType = 'Segment';
  id: number;
  logicalId: string;
  physicalId: string;
  pointFrom: IPoint;
  pointTo: IPoint;
  type: string;
  location: string;
  direction: string;

  segmentParts: ISegmentPart[] = [];
  path = '';
  dirCoord: any;
  dirAngle: any;
  bezierPoints = [];

  length: number;
  speed?: number;
  travelTime?: number;

  disableState?: any;

  candidates?= [];
  isValidate?: boolean;
  validateText?: string;
  updateState?: string;

  constructor(
    row: Dto.ISegment,
    updateState: string,
    fromPoint: IPoint,
    toPoint: IPoint
  ) {
    const {
      id,
      type,
      logicalId,
      physicalId,
      location,
      direction,
      length,
      speed,
      travelTime,
      isValidate,
      candidates,
    } = row;
    this.id = id;
    this.physicalId = physicalId;
    this.logicalId = logicalId;
    this.pointFrom = {
      id: fromPoint.id,
      coord: fromPoint.coord,
      invertedCoord: fromPoint.invertedCoord,
    };
    this.pointTo = {
      id: toPoint.id,
      coord: toPoint.coord,
      invertedCoord: toPoint.invertedCoord,
    };
    this.type = type;
    this.location = location;
    this.direction = direction;
    this.travelTime = travelTime;
    this.isValidate = isValidate;
    this.updateState = updateState;

    this.candidates = candidates;

    this.length = length;
    this.speed = speed;
  }
  static createSegmentPart(
    row: Dto.ISegPart | Dto.ISegPart,
    adjustment: number
  ): ISegmentPart {
    const { type, location, direction, x1, y1, x2, y2 } = row;
    const convertType = (name: string): string => {
      switch (name) {
        case 'STRAIGHT':
          return 'D';
        case '90':
          return 'E';
        default:
          return name;
      }
    };
    const convertDirection = (dir: string): string => {
      switch (dir) {
        case 'CLOCK':
          return 'C';
        case 'COUNTER_CLOCK':
          return 'A';
        default:
          return dir;
      }
    };
    const convertLocation = (loc: string): string => {
      switch (loc) {
        case 'Q1':
          return '1';
        case 'Q2':
          return '2';
        case 'Q3':
          return '3';
        case 'Q4':
          return '4';
        default:
          return loc;
      }
    };
    const coordFrom: ICoordinate = { x: x1, y: y1 };
    const coordTo: ICoordinate = { x: x2, y: y2 };
    return {
      type: convertType(type) || 'D',
      location: convertLocation(location),
      direction: convertDirection(direction),
      radius: null,
      coordFrom: LayoutUtil.create_coordinate(coordFrom, adjustment),
      coordTo: LayoutUtil.create_coordinate(coordTo, adjustment),
    };
  }
  static createSegment(

  ) { }
  postCreation() {
    const { candidates, length, speed } = this;
    this.set_candidates(candidates);
    //this.set_length(this.calculate_length());
    this.set_length(length);
    this.set_speed(speed);
    this.set_travel_time();
  }
  create_segpart(
    type: any,
    radius: any,
    location: any,
    direction: any,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    adjustment: number
  ) {
    return Segment.createSegmentPart(
      { type, direction, location, x1, y1, x2, y2 },
      adjustment
    );
  }
  create_segparts(coord_adjustment) {
    let segparts = [];

    if (this.type === 'D') {
      let direction = LayoutUtil.detect_direction(
        this.pointFrom.coord,
        this.pointTo.coord
      );
      let segpart = this.create_segpart(
        this.type,
        null,
        null,
        direction,
        this.pointFrom.coord.x,
        this.pointFrom.coord.y,
        this.pointTo.coord.x,
        this.pointTo.coord.y,
        coord_adjustment
      );
      segparts.push(segpart);

      // Update direction to summary also
      this.direction = direction;
    } else {
      // Calculate segpart detail coords
      let segparts_info = LayoutUtil.create_segpart_info({
        type: this.type,
        direction: this.direction,
        location: this.location,
        coordFrom: this.pointFrom,
        coordTo: this.pointTo,
      });

      for (let i = 0; i < segparts_info.length; i++) {
        let segpart = this.create_segpart(
          segparts_info[i].type,
          null,
          segparts_info[i].location,
          segparts_info[i].direction,
          segparts_info[i].from.x,
          segparts_info[i].from.y,
          segparts_info[i].to.x,
          segparts_info[i].to.y,
          coord_adjustment
        );
        segparts.push(segpart);
      }
    }

    if (segparts.length > 0) {
      this.segmentParts = segparts;
      this.set_bezier_points();
    }
  }
  get_arrow_path(width: number, length: any) {
    let path;
    let r, dx, dy;

    length = parseInt(length);
    r = width;

    dx = Math.trunc(r * Math.abs(Math.cos(Math.PI / 3)));
    dy = Math.trunc(r * Math.abs(Math.sin(Math.PI / 3)));

    path = `M0 0 m -${dx} -${dy} l 0 ${2 * dy} l ${dx + length} -${dy} Z`;

    return path;
  }
  set_path() {
    this.path = '';

    if (this.type === 'D') {
      // Straight segment
      // Get path
      this.path = this.get_path(
        this.pointFrom.invertedCoord,
        this.pointTo.invertedCoord,
        this.direction,
        this.type,
        this.location
      );

      // Get arrow
      let arrow = this.get_direction_arrow(
        this.pointFrom.invertedCoord,
        this.pointTo.invertedCoord,
        this.direction,
        this.type,
        this.location
      );
      this.dirCoord = arrow.dirCoord;
      this.dirAngle = arrow.dirAngle;
    } else {
      // Curve segment
      // Get path for each segparts
      for (let i = 0; i < this.segmentParts.length; i++) {
        let part = { ...this.segmentParts[i] };

        // invert segpart geometry to draw
        let inverted_geometry = LayoutUtil.invert_geometry(
          part.location,
          part.direction
        );

        part.path = this.get_path(
          part.coordFrom.invertedCoord,
          part.coordTo.invertedCoord,
          inverted_geometry.direction,
          part.type,
          inverted_geometry.location
        );

        // Combine segpart's path to main path
        if (this.path.length > 0) {
          this.path += ' ';
        }
        this.path += part.path;

        // Add direction arrow for middle segpart
        if (i === Math.trunc(this.segmentParts.length * 0.5)) {
          // Get arrow
          let arrow = this.get_direction_arrow(
            part.coordFrom.invertedCoord,
            part.coordTo.invertedCoord,
            inverted_geometry.direction,
            part.type,
            inverted_geometry.location
          );
          this.dirCoord = arrow.dirCoord;
          this.dirAngle = arrow.dirAngle;
        }
      }
    }
  }
  calculate_length(): number {
    const { x: fromX, y: fromY } = this.pointFrom.coord;
    const { x: toX, y: toY } = this.pointTo.coord;
    let width = Math.abs(toX - fromX);
    let height = Math.abs(toY - fromY);

    if (this.type === 'D' || !this.type) {
      return Math.trunc(Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));
    }

    const dimension = defaultSegmentGeometries[this.type];
    if (
      (this.type === 'U' && (this.location === 'T' || this.location === 'B')) ||
      (this.type === 'S' && this.direction === 'N')
    ) {
      width = width / dimension.longSide;
      height = height / dimension.shortSide;
    } else if (
      (this.type === 'U' && (this.location === 'L' || this.location === 'R')) ||
      (this.type === 'S' && this.direction === 'V')
    ) {
      width = width / dimension.shortSide;
      height = height / dimension.longSide;
    } else {
      width = width / dimension.shortSide;
      height = height / dimension.longSide;
    }

    return Math.trunc(width + height + dimension.length / 2);
  }
  set_travel_time() {
    if (this.speed) {
      if (this.length !== 0 && this.speed !== 0) {
        this.travelTime = this.length / this.speed;
      } else {
        this.travelTime = 0;
      }
    }
  }
  add_summary(summary: ISegmentSummary) {
    const { type, location, direction } = summary;
    this.type = type;
    this.location = location;
    this.direction = direction;
  }
  adjust_parts(adjustment: number) {
    let parts: ISegmentPart[];

    if (this.type === 'D') {
      const directionName = LayoutUtil.detect_direction(
        this.pointFrom.coord,
        this.pointTo.coord
      );
      const part = Segment.createSegmentPart(
        {
          type: this.type,
          location: null,
          direction: directionName,
          x1: this.pointFrom.coord.x,
          y1: this.pointFrom.coord.y,
          x2: this.pointTo.coord.x,
          y2: this.pointTo.coord.y,
        },
        adjustment
      );
      // parts.push(part);
      parts = [part];
      this.direction = directionName;
    } else {
      const infos = LayoutUtil.create_segpart_info({
        type: this.type,
        direction: this.direction,
        location: this.location,
        coordFrom: { coord: this.pointFrom.coord },
        coordTo: { coord: this.pointTo.coord },
      });
      parts = infos.map((x) => {
        const { type, location, direction, from, to } = x;
        return Segment.createSegmentPart(
          {
            type,
            location,
            direction,
            x1: from.x,
            y1: from.y,
            x2: to.x,
            y2: to.y,
          },
          adjustment
        );
      });
    }

    if (parts.length > 0) {
      this.segmentParts = parts;
      this.set_bezier_points();
    }
  }
  set_bezier_points() {
    let bezierPoints = [];
    for (let i = 0; i < this.segmentParts.length; i++) {
      const part = this.segmentParts[i];
      const startPoint = [
        part.coordFrom.invertedCoord.x,
        part.coordFrom.invertedCoord.y,
      ];
      bezierPoints.push(startPoint);

      if (part.type === 'E') {
        // Find the segement curve segpart's anchor bezier points
        const inverted_geometry = LayoutUtil.invert_geometry(
          part.location,
          part.direction
        );
        let matrix = LayoutUtil.get_bezier_matrix(
          inverted_geometry.direction,
          part.type,
          inverted_geometry.location
        );
        matrix = matrix.map((item) => item * 1.3);
        let bezier_point = this.calc_bezier_point(
          matrix,
          part.coordFrom.invertedCoord,
          part.coordTo.invertedCoord
        );

        // Add the curved seg part anchor bezier points
        bezierPoints.push([bezier_point.point1.x, bezier_point.point1.y]);
        bezierPoints.push([bezier_point.point2.x, bezier_point.point2.y]);
      }

      if (i === this.segmentParts.length - 1) {
        let endPoint = [
          part.coordTo.invertedCoord.x,
          part.coordTo.invertedCoord.y,
        ];
        bezierPoints.push(endPoint);
      }
    }
    this.bezierPoints = bezierPoints;
  }

  get_offset_path(offset) {
    let new_path = '';

    if (this.type == 'D') {
      // Straight segment
      let new_coord_from: any = {};
      let new_coord_to: any = {};

      new_coord_from.x = this.pointFrom.invertedCoord.x + offset.x;
      new_coord_from.y = this.pointFrom.invertedCoord.y + offset.y;

      new_coord_to.x = this.pointTo.invertedCoord.x + offset.x;
      new_coord_to.y = this.pointTo.invertedCoord.y + offset.y;

      // Get path
      new_path = this.get_path(
        new_coord_from,
        new_coord_to,
        this.direction,
        this.type,
        this.location
      );
    } else {
      // Get path for each segparts
      for (let i = 0; i < this.segmentParts.length; i++) {
        let segpart = this.segmentParts[i];

        let new_coord_from: any = {};
        let new_coord_to: any = {};

        new_coord_from.x = segpart.coordFrom.invertedCoord.x + offset.x;
        new_coord_from.y = segpart.coordFrom.invertedCoord.y + offset.y;

        new_coord_to.x = segpart.coordTo.invertedCoord.x + offset.x;
        new_coord_to.y = segpart.coordTo.invertedCoord.y + offset.y;

        // invert segpart geometry to draw
        let inverted_geometry = LayoutUtil.invert_geometry(
          segpart.location,
          segpart.direction
        );

        let part_path = this.get_path(
          new_coord_from,
          new_coord_to,
          inverted_geometry.direction,
          segpart.type,
          inverted_geometry.location
        );

        // Combine segpart's path to main path
        if (new_path.length > 0) {
          new_path += ' ';
        }
        new_path += part_path;
      }
    }
    return new_path;
  }
  add_segpart(segpart) {
    this.segmentParts.push(segpart);
  }

  remove_segpart() {
    this.segmentParts = [];
    // this.type = 'D'
  }

  set_candidates(candidates) {
    if (candidates !== null) {
      this.candidates = candidates;
    } else {
      this.candidates = [];
    }
  }

  get_candidates() {
    return this.candidates;
  }

  apply_offset(offset, snapDist, invertFactorY) {
    this.pointFrom.coord.x += offset.x;
    this.pointFrom.coord.y += offset.y;

    // Snap original from coord
    this.pointFrom.coord = LayoutUtil.calc_snap_coord(
      this.pointFrom.coord,
      snapDist
    );

    this.pointFrom.invertedCoord.x = this.pointFrom.coord.x;
    this.pointFrom.invertedCoord.y =
      invertFactorY - this.pointFrom.coord.y;

    this.pointTo.coord.x += offset.x;
    this.pointTo.coord.y += offset.y;

    // Snap original from coord
    this.pointTo.coord = LayoutUtil.calc_snap_coord(
      this.pointTo.coord,
      snapDist
    );

    this.pointTo.invertedCoord.x = this.pointTo.coord.x;
    this.pointTo.invertedCoord.y = invertFactorY - this.pointTo.coord.y;

    this.dirCoord.x += offset.x;
    this.dirCoord.y += offset.y;

    // Re-create segpart
    this.create_segparts(invertFactorY);

    // Reset path
    this.set_path();
  }

  recalculate_path(invertFactorY, connected_segments, all_segments) {
    // Re calculate segment candidate
    if (this.candidates.length === 0) {
      let candidates;
      let segments = connected_segments ? connected_segments : all_segments;
      candidates = LayoutUtil.find_segment_candidate(
        this.id,
        this.pointFrom,
        this.pointTo,
        segments
      );

      this.type = candidates[0].type;
      this.location = candidates[0].location;
      this.direction = candidates[0].direction;
    }

    // Check null coord
    if (this.pointFrom === null) {
      const coord = {
        x: 0,
        y: 0,
      };

      this.pointFrom.coord = coord;
      this.pointFrom.invertedCoord = coord;
    }
    if (this.pointTo === null) {
      const coord = {
        x: 0,
        y: 0,
      };

      this.pointTo.coord = coord;
      this.pointTo.invertedCoord = coord;
    }

    this.create_segparts(invertFactorY);

    // Create path
    this.set_path();
  }

  set_length(new_length) {
    if (this.length && this.length !== new_length) {
      console.warn(
        `segment ${this.id} length mismatch: original=${this.length} calculated=${new_length}`
      );
    }
    this.length = new_length;
  }

  set_speed(new_speed) {
    this.speed = new_speed;
  }

  set_disable(disable_info) {
    if (disable_info) {
      this.disableState = {};
      this.disableState.id = disable_info.id;
      this.disableState.segmentId = disable_info.segmentId;
      this.disableState.user = disable_info.user;
      this.disableState.vehicle = disable_info.vehicle;
      this.disableState.segment = disable_info.segment;
    } else {
      this.disableState = null;
    }
  }

  check_disable_segment_disable_control() {
    return (
      this.disableState &&
      (this.disableState.segment.length > 0 ||
        this.disableState.vehicle.length > 0)
    );
  }

  copy(newId) {
    // let id,
    //   physicalId,
    //   logicalId,
    //   type,
    //   location,
    //   direction,
    //   path,
    //   bezierPoints;
    // let speed, length, travelTime;

    // let disableState;
    // let isValidate, updateState;

    // let pointFrom, pointTo;
    // let dirCoord, dirAngle;
    // let candidates;

    let {
      id,
      type,
      logicalId,
      physicalId,
      location,
      direction,
      length,
      speed,
      travelTime,
      isValidate,
      candidates,
      bezierPoints,
      path,
      updateState,
      pointFrom,
      pointTo,
      dirAngle,
      dirCoord,
    } = this;

    // Replace ID
    !_.isNil(newId) && (id = newId);

    const disableState = this.disableState ? { ...this.disableState } : null;

    if (this.disableState) {
      disableState.user = this.disableState.user.map((d) => {
        return { ...d };
      });
      disableState.vehicle = this.disableState.vehicle.map((d) => {
        return { ...d };
      });
      disableState.segment = this.disableState.segment.map((d) => {
        return { ...d };
      });
    }

    // copy segment
    const copied_segment = new Segment(
      {
        id,
        physicalId,
        logicalId,
        type,
        speed,
        length,
        location,
        direction,
        travelTime,
      },
      updateState,
      pointFrom,
      pointTo
    );
    const parts = this.segmentParts.reduce((list, item) => {
      const part: ISegmentPart = {
        coordFrom: {
          coord: { ...item.coordFrom.coord },
          invertedCoord: { ...item.coordFrom.invertedCoord },
        },
        coordTo: {
          coord: { ...item.coordTo.coord },
          invertedCoord: { ...item.coordTo.invertedCoord },
        },
      };
      list.push(part);
      return list;
    }, []);
    copied_segment.segmentParts = parts;

    // Add path
    copied_segment.path = path;

    // Add path
    copied_segment.bezierPoints = bezierPoints;

    // add candidates
    candidates = [];
    for (let i = 0; i < this.candidates.length; i++) {
      let candidate = { ...this.candidates[i] };

      candidates.push(candidate);
    }

    // Add disabled info
    copied_segment.disableState = disableState;

    copied_segment.set_candidates(candidates);

    copied_segment.dirAngle = dirAngle;
    copied_segment.dirCoord = dirCoord;

    copied_segment.validateText = this.validateText;

    return copied_segment;
  }

  reassign_segpart_id(start_id) {
    for (let i = 0; i < this.segmentParts.length; i++) {
      let segpart = this.segmentParts[i];

      segpart.id = start_id++;
    }
  }

  private get_direction_arrow(
    pointFrom: ICoordinate,
    pointTo: ICoordinate,
    direction: string,
    type: string,
    location: string
  ) {
    let arrow: any = {};

    if (type == 'D') {
      arrow.dirCoord = {
        x: Math.trunc((pointFrom.x + pointTo.x) * 0.5),
        y: Math.trunc((pointFrom.y + pointTo.y) * 0.5),
      };

      arrow.dirAngle = Math.atan2(
        pointTo.y - pointFrom.y,
        pointTo.x - pointFrom.x
      );
    } else {
      let matrix = LayoutUtil.get_bezier_matrix(direction, type, location);
      let bezier_point = this.calc_bezier_point(matrix, pointFrom, pointTo);

      arrow.dirCoord = this.getBezier_inner_coord(
        0.5,
        pointFrom,
        bezier_point.point1,
        bezier_point.point2,
        pointTo
      );
      arrow.dirAngle = this.getBezier_angle(
        0.5,
        pointFrom,
        bezier_point.point1,
        bezier_point.point2,
        pointTo
      );
    }

    return arrow;
  }
  private getBezier_angle(
    t: number,
    start: ICoordinate,
    control_point1: ICoordinate,
    control_point2: ICoordinate,
    end: ICoordinate
  ): any {
    let dx =
      Math.pow(1 - t, 2) * (control_point1.x - start.x) +
      2 * t * (1 - t) * (control_point2.x - control_point1.x) +
      t * t * (end.x - control_point2.x);
    let dy =
      Math.pow(1 - t, 2) * (control_point1.y - start.y) +
      2 * t * (1 - t) * (control_point2.y - control_point1.y) +
      t * t * (end.y - control_point2.y);
    return -Math.atan2(dx, dy) + 0.5 * Math.PI;
  }
  private getBezier_inner_coord(
    t: number,
    start: ICoordinate,
    control_point1: ICoordinate,
    control_point2: ICoordinate,
    end: ICoordinate
  ): ICoordinate {
    let x = Math.trunc(
      Math.pow(1 - t, 3) * start.x +
      3 * t * Math.pow(1 - t, 2) * control_point1.x +
      3 * t * t * (1 - t) * control_point2.x +
      t * t * t * end.x
    );
    let y = Math.trunc(
      Math.pow(1 - t, 3) * start.y +
      3 * t * Math.pow(1 - t, 2) * control_point1.y +
      3 * t * t * (1 - t) * control_point2.y +
      t * t * t * end.y
    );

    return { x, y };
  }
  private get_path(
    pointFrom: ICoordinate,
    pointTo: ICoordinate,
    direction: string,
    type: string,
    location: string
  ): string {
    let path;

    if (type == 'D') {
      // Straight segment
      path = `M${pointFrom.x} ${pointFrom.y} L${pointTo.x} ${pointTo.y}`;
    } else {
      // Curve segment
      let matrix = LayoutUtil.get_bezier_matrix(direction, type, location);
      let bezier_point = this.calc_bezier_point(matrix, pointFrom, pointTo);
      path = `M${pointFrom.x} ${pointFrom.y} C${bezier_point.point1.x} ${bezier_point.point1.y} ${bezier_point.point2.x} ${bezier_point.point2.y} ${pointTo.x} ${pointTo.y}`;
    }

    return path;
  }

  private calc_bezier_point(matrix, coordFrom, coordTo) {
    let dist_x, dist_y;

    // Calculate main_css.distance for X coord & Y coord
    dist_x = Math.abs(coordTo.x - coordFrom.x);
    dist_y = Math.abs(coordTo.y - coordFrom.y);

    let point1: ICoordinate = {};
    let point2: ICoordinate = {};

    point1.x = coordFrom.x + dist_x * matrix[0];
    point1.y = coordFrom.y + dist_y * matrix[1];

    point2.x = coordTo.x + dist_x * matrix[2];
    point2.y = coordTo.y + dist_y * matrix[3];

    return {
      point1,
      point2,
    };
  }
}
