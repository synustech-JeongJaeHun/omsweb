import { LayoutUtil } from '../modules/shared/utils/layout.util';
import { ICoordinate } from './drawing.model';
import { Dto } from './dto/track.model';
import { IPoint } from './map.interface';
import { Point } from './point.model';

export class MTL {
  id: number;
  logical_id: string;
  physical_id: string;
  point_id?: any;

  coord: ICoordinate;
  inverted_coord: ICoordinate;

  in_use?: boolean;
  position?: any;
  mode?: any;
  error_list?: any;

  is_validate?: boolean;
  update_state?: string;
  group?: number;

  constructor(
    row: Dto.IMTL,
    is_validate: boolean,
    update_state: string,
    point: IPoint
  ) {
    const {
      id,
      logical_id,
      physical_id,
      point_id,
      group,
      position,
      in_use,
      mode,
      error_list,
    } = row;
    this.id = id;
    this.logical_id = logical_id;
    this.physical_id = physical_id;
    this.point_id = point_id;
    this.group = group;

    this.is_validate = is_validate;
    this.update_state = update_state;

    this.coord = point.coord;
    this.inverted_coord = point.inverted_coord;

    this.position = position;
    this.in_use = in_use;
    this.mode = mode;
    this.error_list = error_list;
  }

  copy(new_id) {
    let {
      id,
      physical_id,
      logical_id,
      point_id,
      coord,
      inverted_coord,
      in_use,
      position,
      mode,
      error_list,
      group,
      is_validate,
      update_state,
    } = this;

    // Replace ID
    if (new_id === null || new_id === undefined) {
      id = this.id;
    } else {
      id = new_id;
    }

    physical_id = this.physical_id;
    logical_id = this.logical_id;
    point_id = this.point_id;
    in_use = this.in_use;
    position = this.position;
    mode = this.mode;
    error_list = this.error_list;

    is_validate = this.is_validate;
    update_state = this.update_state;

    // Object
    coord = { ...this.coord };
    inverted_coord = { ...this.inverted_coord };
    group = this.group;

    let copied_mtl = new MTL(
      {
        id,
        physical_id,
        logical_id,
        point_id,
        in_use,
        position,
        mode,
        error_list,
        group,
      },
      is_validate,
      update_state,
      { coord, inverted_coord }
    );

    return copied_mtl;
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
