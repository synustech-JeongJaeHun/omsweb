import { LayoutUtil } from '../modules/shared/utils/layout.util';
import { ICoordinate } from './drawing.model';
import { Dto } from './dto/track.model';
import { IPoint } from './map.interface';
import { Point } from './point.model';
import { Segment } from './segment.model';

export class Buffer {
  id: number;
  logical_id: string;
  physical_id: string;
  point_id?: any;

  coord: ICoordinate;
  inverted_coord: ICoordinate;
  direction: string;

  is_validate?: boolean;
  update_state?: string;
  group?: number;

  segment_direction?: any;
  direction_offset?: any;

  constructor(
    row: Dto.IBuffer,
    is_validate: boolean,
    update_state: string,
    point: IPoint
  ) {
    const { id, logical_id, physical_id, point_id, group, direction } = row;
    this.id = id;
    this.logical_id = logical_id;
    this.physical_id = physical_id;
    this.point_id = point_id;
    this.direction = direction || 'U';
    this.group = group;

    this.is_validate = is_validate;
    this.update_state = update_state;

    this.coord = point.coord;
    this.inverted_coord = point.inverted_coord;
  }

  set_direction_attr(segments: Segment[]) {
    this.segment_direction = LayoutUtil.find_location_object_direction_at_point(
      this.point_id,
      segments
    ); // returns inverted 'T' and 'B' due to map inversion
    this.direction_offset = LayoutUtil.get_location_object_direction_offset(
      this.direction,
      this.segment_direction,
      this.constructor.name
    );
  }

  copy(new_id) {
    let id,
      physical_id,
      logical_id,
      point_id,
      coord,
      inverted_coord,
      direction,
      group;
    let is_validate, update_state;

    // Replace ID
    if (new_id === null || new_id === undefined) {
      id = this.id;
    } else {
      id = new_id;
    }

    physical_id = this.physical_id;
    logical_id = this.logical_id;
    point_id = this.point_id;
    direction = this.direction;

    is_validate = this.is_validate;
    update_state = this.update_state;
    group = this.group;

    // Object
    coord = { ...this.coord };
    inverted_coord = { ...this.inverted_coord };

    let copied_buffer = new Buffer(
      { id, physical_id, logical_id, point_id, direction, group },
      is_validate,
      update_state,
      { coord, inverted_coord }
    );

    copied_buffer.segment_direction = this.segment_direction;
    copied_buffer.direction_offset = this.direction_offset;

    return copied_buffer;
  }

  apply_offset(offset, snap_dist, invert_factor_y) {
    this.coord.x += offset.x;
    this.coord.y += offset.y;

    // Snap original coord
    this.coord = LayoutUtil.calc_snap_coord(this.coord, snap_dist);

    this.inverted_coord.x = this.coord.x;
    this.inverted_coord.y = invert_factor_y - this.coord.y;
  }
}
