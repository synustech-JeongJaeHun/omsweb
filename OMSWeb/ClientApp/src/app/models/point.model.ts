import { ICoordinate } from './drawing.model';
import { ICoordinateInfo } from './map.interface';
import { Dto } from './dto/track.model';
import {IPoint} from './map.interface';

export class Point implements IPoint {
  id?: number;
  logical_id?: string;
  physical_id?: string;
  coord: ICoordinate;
  inverted_coord: ICoordinate;
  is_validate?: boolean;
  validate_text?: string;
  update_state?: string;

  constructor(
    row: Dto.IPoint,
    coordInfo: ICoordinateInfo,
    isValid: boolean,
    updateState: string
  ) {
    this.id = row.id;
    this.logical_id = row.logical_id;
    this.physical_id = row.physical_id;
    this.coord = coordInfo.coord;
    this.inverted_coord = coordInfo.inverted_coord;
    this.is_validate = isValid;
    this.update_state = updateState;
  }

  apply_offset(offset, snap_dist, invert_factor_y) {
    this.coord.x += offset.x;
    this.coord.y += offset.y;

    // Snap original coord
    // this.coord = Util.layout.calc_snap_coord(this.coord, snap_dist)

    this.inverted_coord.x = this.coord.x;
    this.inverted_coord.y = invert_factor_y - this.coord.y;
  }

  copy(new_id) {
    let id,
      physical_id,
      logical_id,
      coord,
      inverted_coord,
      is_validate,
      update_state,
      validate_text;

    // Replace ID
    if (new_id === null || new_id === undefined) {
      id = this.id;
    } else {
      id = new_id;
    }

    physical_id = this.physical_id;
    logical_id = this.logical_id;

    is_validate = this.is_validate;
    update_state = this.update_state;

    // Object
    coord = { ...this.coord };
    inverted_coord = { ...this.inverted_coord };

    let copied_point = new Point(
      {
        id,
        physical_id,
        logical_id,
      },
      {
        coord,
        inverted_coord,
      },
      is_validate,
      update_state
    );
    copied_point.validate_text = this.validate_text;

    return copied_point;
  }
}
