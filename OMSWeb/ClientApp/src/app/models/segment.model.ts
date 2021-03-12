import * as _ from 'lodash';
import { ICoordinate } from './drawing.model';
import { Dto } from './dto/track.model';
import { Point } from './point.model';
import { IPoint, ISegment, ISegmentPart, ISegmentSummary } from './map.interface';
import { LayoutUtil } from '../modules/shared/utils/layout.util';
import { default_segment_geometries } from './map-constants';
// import { MapParser } from '../modules/shared/viewers/map-parser';

export class Segment implements ISegment {
  id: number;
  logical_id: string;
  physical_id: string;
  point_from: IPoint;
  point_to: IPoint;
  type: string;
  location: string;
  direction: string;

  segment_parts: ISegmentPart[] = [];
  path = '';
  dir_coord: any;
  dir_angle: any;
  bezier_points = [];

  length: number;
  speed?: number;
  travel_time?: number;

  disable_state?: any;

  candidates? = [];
  is_validate?: boolean;
  validate_text?: string;
  update_state?: string;

  constructor(
    row: Dto.ISegment,
    updateState: string,
    fromPoint: IPoint,
    toPoint: IPoint
  ) {
    const {
      id,
      type,
      logical_id,
      physical_id,
      location,
      direction,
      length,
      speed,
      travel_time,
      is_validate,
      candidates,
    } = row;
    this.id = id;
    this.physical_id = physical_id;
    this.logical_id = logical_id;
    this.point_from = {
      id: fromPoint.id,
      coord: fromPoint.coord,
      inverted_coord: fromPoint.inverted_coord,
    };
    this.point_to = {
      id: toPoint.id,
      coord: toPoint.coord,
      inverted_coord: toPoint.inverted_coord,
    };
    this.type = type;
    this.location = location;
    this.direction = direction;
    this.travel_time = travel_time;
    this.is_validate = is_validate;
    this.update_state = updateState;

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
      coord_from: LayoutUtil.create_coordinate(coordFrom, adjustment),
      coord_to: LayoutUtil.create_coordinate(coordTo, adjustment),
    };
  }
  static createSegment(

  ) {}
  postCreation() {
    const { candidates, speed } = this;
    this.set_candidates(candidates);
    this.set_length(this.calculate_length());
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
        this.point_from.coord,
        this.point_to.coord
      );
      let segpart = this.create_segpart(
        this.type,
        null,
        null,
        direction,
        this.point_from.coord.x,
        this.point_from.coord.y,
        this.point_to.coord.x,
        this.point_to.coord.y,
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
        coord_from: this.point_from,
        coord_to: this.point_to,
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
      this.segment_parts = segparts;
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
        this.point_from.inverted_coord,
        this.point_to.inverted_coord,
        this.direction,
        this.type,
        this.location
      );

      // Get arrow
      let arrow = this.get_direction_arrow(
        this.point_from.inverted_coord,
        this.point_to.inverted_coord,
        this.direction,
        this.type,
        this.location
      );
      this.dir_coord = arrow.dir_coord;
      this.dir_angle = arrow.dir_angle;
    } else {
      // Curve segment
      // Get path for each segparts
      for (let i = 0; i < this.segment_parts.length; i++) {
        let part = { ...this.segment_parts[i] };

        // invert segpart geometry to draw
        let inverted_geometry = LayoutUtil.invert_geometry(
          part.location,
          part.direction
        );

        part.path = this.get_path(
          part.coord_from.inverted_coord,
          part.coord_to.inverted_coord,
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
        if (i === Math.trunc(this.segment_parts.length * 0.5)) {
          // Get arrow
          let arrow = this.get_direction_arrow(
            part.coord_from.inverted_coord,
            part.coord_to.inverted_coord,
            inverted_geometry.direction,
            part.type,
            inverted_geometry.location
          );
          this.dir_coord = arrow.dir_coord;
          this.dir_angle = arrow.dir_angle;
        }
      }
    }
  }
  calculate_length(): number {
    const { x: fromX, y: fromY } = this.point_from.coord;
    const { x: toX, y: toY } = this.point_to.coord;
    let width = Math.abs(toX - fromX);
    let height = Math.abs(toY - fromY);

    if (this.type === 'D' || !this.type) {
      return Math.trunc(Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));
    }

    const dimension = default_segment_geometries[this.type];
    if (
      (this.type === 'U' && (this.location === 'T' || this.location === 'B')) ||
      (this.type === 'S' && this.direction === 'N')
    ) {
      width = width / dimension.long_side;
      height = height / dimension.short_side;
    } else if (
      (this.type === 'U' && (this.location === 'L' || this.location === 'R')) ||
      (this.type === 'S' && this.direction === 'V')
    ) {
      width = width / dimension.short_side;
      height = height / dimension.long_side;
    } else {
      width = width / dimension.short_side;
      height = height / dimension.long_side;
    }

    return Math.trunc(width + height + dimension.length / 2);
  }
  set_travel_time() {
    if (this.speed) {
      if (this.length !== 0 && this.speed !== 0) {
        this.travel_time = this.length / this.speed;
      } else {
        this.travel_time = 0;
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
        this.point_from.coord,
        this.point_to.coord
      );
      const part = Segment.createSegmentPart(
        {
          type: this.type,
          location: null,
          direction: directionName,
          x1: this.point_from.coord.x,
          y1: this.point_from.coord.y,
          x2: this.point_to.coord.x,
          y2: this.point_to.coord.y,
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
        coord_from: { coord: this.point_from.coord },
        coord_to: { coord: this.point_to.coord },
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
      this.segment_parts = parts;
      this.set_bezier_points();
    }
  }
  set_bezier_points() {
    let bezier_points = [];
    for (let i = 0; i < this.segment_parts.length; i++) {
      const part = this.segment_parts[i];
      const start_point = [
        part.coord_from.inverted_coord.x,
        part.coord_from.inverted_coord.y,
      ];
      bezier_points.push(start_point);

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
          part.coord_from.inverted_coord,
          part.coord_to.inverted_coord
        );

        // Add the curved seg part anchor bezier points
        bezier_points.push([bezier_point.point1.x, bezier_point.point1.y]);
        bezier_points.push([bezier_point.point2.x, bezier_point.point2.y]);
      }

      if (i === this.segment_parts.length - 1) {
        let end_point = [
          part.coord_to.inverted_coord.x,
          part.coord_to.inverted_coord.y,
        ];
        bezier_points.push(end_point);
      }
    }
    this.bezier_points = bezier_points;
  }

  get_offset_path(offset) {
    let new_path = '';

    if (this.type == 'D') {
      // Straight segment
      let new_coord_from: any = {};
      let new_coord_to: any = {};

      new_coord_from.x = this.point_from.inverted_coord.x + offset.x;
      new_coord_from.y = this.point_from.inverted_coord.y + offset.y;

      new_coord_to.x = this.point_to.inverted_coord.x + offset.x;
      new_coord_to.y = this.point_to.inverted_coord.y + offset.y;

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
      for (let i = 0; i < this.segment_parts.length; i++) {
        let segpart = this.segment_parts[i];

        let new_coord_from: any = {};
        let new_coord_to: any = {};

        new_coord_from.x = segpart.coord_from.inverted_coord.x + offset.x;
        new_coord_from.y = segpart.coord_from.inverted_coord.y + offset.y;

        new_coord_to.x = segpart.coord_to.inverted_coord.x + offset.x;
        new_coord_to.y = segpart.coord_to.inverted_coord.y + offset.y;

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
    this.segment_parts.push(segpart);
  }

  remove_segpart() {
    this.segment_parts = [];
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

  apply_offset(offset, snap_dist, invert_factor_y) {
    this.point_from.coord.x += offset.x;
    this.point_from.coord.y += offset.y;

    // Snap original from coord
    this.point_from.coord = LayoutUtil.calc_snap_coord(
      this.point_from.coord,
      snap_dist
    );

    this.point_from.inverted_coord.x = this.point_from.coord.x;
    this.point_from.inverted_coord.y =
      invert_factor_y - this.point_from.coord.y;

    this.point_to.coord.x += offset.x;
    this.point_to.coord.y += offset.y;

    // Snap original from coord
    this.point_to.coord = LayoutUtil.calc_snap_coord(
      this.point_to.coord,
      snap_dist
    );

    this.point_to.inverted_coord.x = this.point_to.coord.x;
    this.point_to.inverted_coord.y = invert_factor_y - this.point_to.coord.y;

    this.dir_coord.x += offset.x;
    this.dir_coord.y += offset.y;

    // Re-create segpart
    this.create_segparts(invert_factor_y);

    // Reset path
    this.set_path();
  }

  recalculate_path(invert_factor_y, connected_segments, all_segments) {
    // Re calculate segment candidate
    if (this.candidates.length === 0) {
      let candidates;
      let segments = connected_segments ? connected_segments : all_segments;
      candidates = LayoutUtil.find_segment_candidate(
        this.id,
        this.point_from,
        this.point_to,
        segments
      );

      this.type = candidates[0].type;
      this.location = candidates[0].location;
      this.direction = candidates[0].direction;
    }

    // Check null coord
    if (this.point_from === null) {
      const coord = {
        x: 0,
        y: 0,
      };

      this.point_from.coord = coord;
      this.point_from.inverted_coord = coord;
    }
    if (this.point_to === null) {
      const coord = {
        x: 0,
        y: 0,
      };

      this.point_to.coord = coord;
      this.point_to.inverted_coord = coord;
    }

    this.create_segparts(invert_factor_y);

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
      this.disable_state = {};
      this.disable_state.id = disable_info.id;
      this.disable_state.segment_id = disable_info.segment_id;
      this.disable_state.user = disable_info.user;
      this.disable_state.vehicle = disable_info.vehicle;
      this.disable_state.segment = disable_info.segment;
    } else {
      this.disable_state = null;
    }
  }

  check_disable_segment_disable_control() {
    return (
      this.disable_state &&
      (this.disable_state.segment.length > 0 ||
        this.disable_state.vehicle.length > 0)
    );
  }

  copy(new_id) {
    // let id,
    //   physical_id,
    //   logical_id,
    //   type,
    //   location,
    //   direction,
    //   path,
    //   bezier_points;
    // let speed, length, travel_time;

    // let disable_state;
    // let is_validate, update_state;

    // let point_from, point_to;
    // let dir_coord, dir_angle;
    // let candidates;

    let {
      id,
      type,
      logical_id,
      physical_id,
      location,
      direction,
      length,
      speed,
      travel_time,
      is_validate,
      candidates,
      bezier_points,
      path,
      update_state,
      point_from,
      point_to,
      dir_angle,
      dir_coord,
    } = this;

    // Replace ID
    !_.isNil(new_id) && (id = new_id);

    const disable_state = this.disable_state ? { ...this.disable_state } : null;

    if (this.disable_state) {
      disable_state.user = this.disable_state.user.map((d) => {
        return { ...d };
      });
      disable_state.vehicle = this.disable_state.vehicle.map((d) => {
        return { ...d };
      });
      disable_state.segment = this.disable_state.segment.map((d) => {
        return { ...d };
      });
    }

    // copy segment
    const copied_segment = new Segment(
      {
        id,
        physical_id,
        logical_id,
        type,
        speed,
        length,
        location,
        direction,
        travel_time,
      },
      update_state,
      point_from,
      point_to
    );
    const parts = this.segment_parts.reduce((list, item) => {
      const part: ISegmentPart = {
        coord_from: {
          coord: { ...item.coord_from.coord },
          inverted_coord: { ...item.coord_from.inverted_coord },
        },
        coord_to: {
          coord: { ...item.coord_to.coord },
          inverted_coord: { ...item.coord_to.inverted_coord },
        },
      };
      list.push(part);
      return list;
    }, []);
    copied_segment.segment_parts = parts;

    // Add path
    copied_segment.path = path;

    // Add path
    copied_segment.bezier_points = bezier_points;

    // add candidates
    candidates = [];
    for (let i = 0; i < this.candidates.length; i++) {
      let candidate = { ...this.candidates[i] };

      candidates.push(candidate);
    }

    // Add disabled info
    copied_segment.disable_state = disable_state;

    copied_segment.set_candidates(candidates);

    copied_segment.dir_angle = dir_angle;
    copied_segment.dir_coord = dir_coord;

    copied_segment.validate_text = this.validate_text;

    return copied_segment;
  }

  reassign_segpart_id(start_id) {
    for (let i = 0; i < this.segment_parts.length; i++) {
      let segpart = this.segment_parts[i];

      segpart.id = start_id++;
    }
  }

  private get_direction_arrow(
    point_from: ICoordinate,
    point_to: ICoordinate,
    direction: string,
    type: string,
    location: string
  ) {
    let arrow: any = {};

    if (type == 'D') {
      arrow.dir_coord = {
        x: Math.trunc((point_from.x + point_to.x) * 0.5),
        y: Math.trunc((point_from.y + point_to.y) * 0.5),
      };

      arrow.dir_angle = Math.atan2(
        point_to.y - point_from.y,
        point_to.x - point_from.x
      );
    } else {
      let matrix = LayoutUtil.get_bezier_matrix(direction, type, location);
      let bezier_point = this.calc_bezier_point(matrix, point_from, point_to);

      arrow.dir_coord = this.getBezier_inner_coord(
        0.5,
        point_from,
        bezier_point.point1,
        bezier_point.point2,
        point_to
      );
      arrow.dir_angle = this.getBezier_angle(
        0.5,
        point_from,
        bezier_point.point1,
        bezier_point.point2,
        point_to
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
    point_from: ICoordinate,
    point_to: ICoordinate,
    direction: string,
    type: string,
    location: string
  ): string {
    let path;

    if (type == 'D') {
      // Straight segment
      path = `M${point_from.x} ${point_from.y} L${point_to.x} ${point_to.y}`;
    } else {
      // Curve segment
      let matrix = LayoutUtil.get_bezier_matrix(direction, type, location);
      let bezier_point = this.calc_bezier_point(matrix, point_from, point_to);
      path = `M${point_from.x} ${point_from.y} C${bezier_point.point1.x} ${bezier_point.point1.y} ${bezier_point.point2.x} ${bezier_point.point2.y} ${point_to.x} ${point_to.y}`;
    }

    return path;
  }

  private calc_bezier_point(matrix, coord_from, coord_to) {
    let dist_x, dist_y;

    // Calculate main_css.distance for X coord & Y coord
    dist_x = Math.abs(coord_to.x - coord_from.x);
    dist_y = Math.abs(coord_to.y - coord_from.y);

    let point1: ICoordinate = {};
    let point2: ICoordinate = {};

    point1.x = coord_from.x + dist_x * matrix[0];
    point1.y = coord_from.y + dist_y * matrix[1];

    point2.x = coord_to.x + dist_x * matrix[2];
    point2.y = coord_to.y + dist_y * matrix[3];

    return {
      point1,
      point2,
    };
  }
}
