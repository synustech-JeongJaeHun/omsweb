import * as _ from 'lodash';

import { ICoordinate } from '../../../models/drawing.model';
import {
  ISegmentPart,
  ISegmentSummary,
  ICoordinateInfo,
  ISegment,
} from '../../../models/map.interface';
import { main_css } from './css-loader';

export namespace LayoutUtil {
  const BEZIER_MATRIX = {
    D_E: {
      '1': [0.5, 0, 0, -0.5],
      '2': [0, -0.5, -0.5, 0],
      '3': [-0.5, 0, 0, 0.5],
      '4': [0, 0.5, 0.5, 0],
    },
    D_E_A: {
      '1': [0, -0.5, 0.5, 0],
      '2': [-0.5, 0, 0, -0.5],
      '3': [0, 0.5, -0.5, 0],
      '4': [0.5, 0, 0, 0.5],
    },
    D_U: {
      T: [0, -0.5, 0, -0.5],
      R: [0.5, 0, 0.5, 0],
      B: [0, 0.5, 0, 0.5],
      L: [-0.5, 0, -0.5, 0],
    },
    D_S: {
      '1': [0.75, 0, -0.75, 0],
      '2': [0, 0.75, 0, -0.75],
      '3': [-0.75, 0, 0.75, 0],
      '4': [0, -0.75, 0, 0.75],
    },
  };

  /*
    This definition is based on real coord, if the system useses inverted coord
    then you need to invert geometry
    */
  const SEGPART_DEFINITION = [
    {
      type: 'D',
      location: null,
      direction: 'T',
      start_end_dir: 'T',
      segpart: [{ type: 'D', location: null, direction: 'T' }],
    },
    {
      type: 'D',
      location: null,
      direction: 'R',
      start_end_dir: 'R',
      segpart: [{ type: 'D', location: null, direction: 'R' }],
    },
    {
      type: 'D',
      location: null,
      direction: 'B',
      start_end_dir: 'B',
      segpart: [{ type: 'D', location: null, direction: 'B' }],
    },
    {
      type: 'D',
      location: null,
      direction: 'L',
      start_end_dir: 'L',
      segpart: [{ type: 'D', location: null, direction: 'L' }],
    },
    {
      type: 'E',
      location: '1',
      direction: 'C',
      start_end_dir: 'BR',
      segpart: [
        { type: 'D', location: null, direction: 'R' },
        { type: 'E', location: '1', direction: 'C' },
        { type: 'D', location: null, direction: 'B' },
      ],
    },
    {
      type: 'E',
      location: '2',
      direction: 'C',
      start_end_dir: 'TR',
      segpart: [
        { type: 'D', location: null, direction: 'T' },
        { type: 'E', location: '2', direction: 'C' },
        { type: 'D', location: null, direction: 'R' },
      ],
    },
    {
      type: 'E',
      location: '3',
      direction: 'C',
      start_end_dir: 'TL',
      segpart: [
        { type: 'D', location: null, direction: 'L' },
        { type: 'E', location: '3', direction: 'C' },
        { type: 'D', location: null, direction: 'T' },
      ],
    },
    {
      type: 'E',
      location: '4',
      direction: 'C',
      start_end_dir: 'BL',
      segpart: [
        { type: 'D', location: null, direction: 'B' },
        { type: 'E', location: '4', direction: 'C' },
        { type: 'D', location: null, direction: 'L' },
      ],
    },
    {
      type: 'E',
      location: '1',
      direction: 'A',
      start_end_dir: 'TL',
      segpart: [
        { type: 'D', location: null, direction: 'T' },
        { type: 'E', location: '1', direction: 'C' },
        { type: 'D', location: null, direction: 'L' },
      ],
    },
    {
      type: 'E',
      location: '2',
      direction: 'A',
      start_end_dir: 'BL',
      segpart: [
        { type: 'D', location: null, direction: 'L' },
        { type: 'E', location: '2', direction: 'C' },
        { type: 'D', location: null, direction: 'B' },
      ],
    },
    {
      type: 'E',
      location: '3',
      direction: 'A',
      start_end_dir: 'BR',
      segpart: [
        { type: 'D', location: null, direction: 'B' },
        { type: 'E', location: '3', direction: 'C' },
        { type: 'D', location: null, direction: 'R' },
      ],
    },
    {
      type: 'E',
      location: '4',
      direction: 'A',
      start_end_dir: 'TR',
      segpart: [
        { type: 'D', location: null, direction: 'R' },
        { type: 'E', location: '4', direction: 'C' },
        { type: 'D', location: null, direction: 'T' },
      ],
    },
    {
      type: 'U',
      location: 'T',
      direction: 'C',
      start_end_dir: 'R',
      segpart: [
        { type: 'D', location: null, direction: 'T' },
        { type: 'E', location: '2', direction: 'C' },
        { type: 'D', location: null, direction: 'R' },
        { type: 'E', location: '1', direction: 'C' },
        { type: 'D', location: null, direction: 'B' },
      ],
    },
    {
      type: 'U',
      location: 'R',
      direction: 'C',
      start_end_dir: 'B',
      segpart: [
        { type: 'D', location: null, direction: 'R' },
        { type: 'E', location: '1', direction: 'C' },
        { type: 'D', location: null, direction: 'B' },
        { type: 'E', location: '4', direction: 'C' },
        { type: 'D', location: null, direction: 'L' },
      ],
    },
    {
      type: 'U',
      location: 'B',
      direction: 'C',
      start_end_dir: 'L',
      segpart: [
        { type: 'D', location: null, direction: 'B' },
        { type: 'E', location: '4', direction: 'C' },
        { type: 'D', location: null, direction: 'L' },
        { type: 'E', location: '3', direction: 'C' },
        { type: 'D', location: null, direction: 'T' },
      ],
    },
    {
      type: 'U',
      location: 'L',
      direction: 'C',
      start_end_dir: 'T',
      segpart: [
        { type: 'D', location: null, direction: 'L' },
        { type: 'E', location: '3', direction: 'C' },
        { type: 'D', location: null, direction: 'T' },
        { type: 'E', location: '2', direction: 'C' },
        { type: 'D', location: null, direction: 'R' },
      ],
    },
    {
      type: 'U',
      location: 'T',
      direction: 'A',
      start_end_dir: 'L',
      segpart: [
        { type: 'D', location: null, direction: 'T' },
        { type: 'E', location: '1', direction: 'A' },
        { type: 'D', location: null, direction: 'L' },
        { type: 'E', location: '2', direction: 'A' },
        { type: 'D', location: null, direction: 'B' },
      ],
    },
    {
      type: 'U',
      location: 'R',
      direction: 'A',
      start_end_dir: 'T',
      segpart: [
        { type: 'D', location: null, direction: 'R' },
        { type: 'E', location: '4', direction: 'A' },
        { type: 'D', location: null, direction: 'T' },
        { type: 'E', location: '1', direction: 'A' },
        { type: 'D', location: null, direction: 'L' },
      ],
    },
    {
      type: 'U',
      location: 'B',
      direction: 'A',
      start_end_dir: 'R',
      segpart: [
        { type: 'D', location: null, direction: 'B' },
        { type: 'E', location: '3', direction: 'A' },
        { type: 'D', location: null, direction: 'R' },
        { type: 'E', location: '4', direction: 'A' },
        { type: 'D', location: null, direction: 'T' },
      ],
    },
    {
      type: 'U',
      location: 'L',
      direction: 'A',
      start_end_dir: 'B',
      segpart: [
        { type: 'D', location: null, direction: 'L' },
        { type: 'E', location: '2', direction: 'A' },
        { type: 'D', location: null, direction: 'B' },
        { type: 'E', location: '3', direction: 'A' },
        { type: 'D', location: null, direction: 'R' },
      ],
    },
    {
      type: 'S',
      location: '1',
      direction: 'H',
      start_end_dir: 'TR',
      segpart: [
        { type: 'D', location: null, direction: 'R' },
        { type: 'E', location: '4', direction: 'A' },
        { type: 'D', location: null, direction: 'T' },
        { type: 'E', location: '2', direction: 'C' },
        { type: 'D', location: null, direction: 'R' },
      ],
    },
    {
      type: 'S',
      location: '2',
      direction: 'H',
      start_end_dir: 'TL',
      segpart: [
        { type: 'D', location: null, direction: 'L' },
        { type: 'E', location: '3', direction: 'C' },
        { type: 'D', location: null, direction: 'T' },
        { type: 'E', location: '1', direction: 'A' },
        { type: 'D', location: null, direction: 'L' },
      ],
    },
    {
      type: 'S',
      location: '3',
      direction: 'H',
      start_end_dir: 'BL',
      segpart: [
        { type: 'D', location: null, direction: 'L' },
        { type: 'E', location: '2', direction: 'A' },
        { type: 'D', location: null, direction: 'B' },
        { type: 'E', location: '4', direction: 'C' },
        { type: 'D', location: null, direction: 'L' },
      ],
    },
    {
      type: 'S',
      location: '4',
      direction: 'H',
      start_end_dir: 'BR',
      segpart: [
        { type: 'D', location: null, direction: 'R' },
        { type: 'E', location: '1', direction: 'C' },
        { type: 'D', location: null, direction: 'B' },
        { type: 'E', location: '3', direction: 'A' },
        { type: 'D', location: null, direction: 'R' },
      ],
    },
    {
      type: 'S',
      location: '1',
      direction: 'V',
      start_end_dir: 'TR',
      segpart: [
        { type: 'D', location: null, direction: 'T' },
        { type: 'E', location: '2', direction: 'C' },
        { type: 'D', location: null, direction: 'R' },
        { type: 'E', location: '4', direction: 'A' },
        { type: 'D', location: null, direction: 'T' },
      ],
    },
    {
      type: 'S',
      location: '2',
      direction: 'V',
      start_end_dir: 'TL',
      segpart: [
        { type: 'D', location: null, direction: 'T' },
        { type: 'E', location: '1', direction: 'A' },
        { type: 'D', location: null, direction: 'L' },
        { type: 'E', location: '3', direction: 'C' },
        { type: 'D', location: null, direction: 'T' },
      ],
    },
    {
      type: 'S',
      location: '3',
      direction: 'V',
      start_end_dir: 'BL',
      segpart: [
        { type: 'D', location: null, direction: 'B' },
        { type: 'E', location: '4', direction: 'C' },
        { type: 'D', location: null, direction: 'L' },
        { type: 'E', location: '2', direction: 'A' },
        { type: 'D', location: null, direction: 'B' },
      ],
    },
    {
      type: 'S',
      location: '4',
      direction: 'V',
      start_end_dir: 'BR',
      segpart: [
        { type: 'D', location: null, direction: 'B' },
        { type: 'E', location: '3', direction: 'A' },
        { type: 'D', location: null, direction: 'R' },
        { type: 'E', location: '1', direction: 'C' },
        { type: 'D', location: null, direction: 'B' },
      ],
    },
  ];

  export const detect_direction = (
    source: ICoordinate,
    target: ICoordinate
  ) => {
    if (source.x == target.x && source.y > target.y) {
      return 'T';
    } else if (source.x == target.x && source.y < target.y) {
      return 'B';
    } else if (source.x < target.x && source.y == target.y) {
      return 'R';
    } else if (source.x > target.x && source.y == target.y) {
      return 'L';
    } else if (source.x > target.x && source.y > target.y) {
      return 'TL';
    } else if (source.x > target.x && source.y < target.y) {
      return 'BL';
    } else if (source.x < target.x && source.y > target.y) {
      return 'TR';
    } else if (source.x < target.x && source.y < target.y) {
      return 'BR';
    }
  };

  export const find_segment_summary = (
    direction: string,
    parts: ISegmentPart[]
  ): ISegmentSummary => {
    const len = parts.length;
    let summary: ISegmentSummary = null;

    if (len === 1) {
      // straight
      const { type, location } = parts[0];
      if (type === 'D') {
        summary = { type, location, direction };
      }
    } else if (len === 3) {
      // 90
      if (
        parts[0].type === 'D' &&
        parts[1].type === 'E' &&
        parts[2].type === 'D'
      ) {
        const { type, location, direction } = parts[1];
        summary = { type, location, direction };
      }
    } else if (len === 5) {
      // 180, 5
      if (
        parts[0].type === 'D' &&
        parts[1].type === 'E' &&
        parts[2].type === 'D' &&
        parts[3].type === 'E' &&
        parts[4].type === 'D'
      ) {
        if (parts[1].direction === parts[3].direction) {
          const twoLocations = parts[1].location + parts[3].location;
          if (twoLocations.includes('1') && twoLocations.includes('2')) {
            summary = {
              type: 'U',
              location: 'T',
              direction: parts[1].direction,
            };
          }
          if (twoLocations.includes('1') && twoLocations.includes('4')) {
            summary = {
              type: 'U',
              location: 'R',
              direction: parts[1].direction,
            };
          }
          if (twoLocations.includes('3') && twoLocations.includes('4')) {
            summary = {
              type: 'U',
              location: 'B',
              direction: parts[1].direction,
            };
          }
          if (twoLocations.includes('2') && twoLocations.includes('3')) {
            summary = {
              type: 'U',
              location: 'L',
              direction: parts[1].direction,
            };
          }
        } else {
          if (
            parts[1].location === '4' &&
            parts[1].direction === 'A' &&
            parts[3].location === '2' &&
            parts[3].direction === 'C'
          ) {
            summary = { type: 'S', location: '1', direction: 'H' };
          } else if (
            parts[1].location === '3' &&
            parts[1].direction === 'C' &&
            parts[3].location === '1' &&
            parts[3].direction === 'A'
          ) {
            summary = { type: 'S', location: '2', direction: 'H' };
          } else if (
            parts[1].location === '2' &&
            parts[1].direction === 'A' &&
            parts[3].location === '4' &&
            parts[3].direction === 'C'
          ) {
            summary = { type: 'S', location: '3', direction: 'H' };
          } else if (
            parts[1].location === '1' &&
            parts[1].direction === 'C' &&
            parts[3].location === '3' &&
            parts[3].direction === 'A'
          ) {
            summary = { type: 'S', location: '4', direction: 'H' };
          } else if (
            parts[1].location === '2' &&
            parts[1].direction === 'C' &&
            parts[3].location === '4' &&
            parts[3].direction === 'A'
          ) {
            summary = { type: 'S', location: '1', direction: 'V' };
          } else if (
            parts[1].location === '1' &&
            parts[1].direction === 'A' &&
            parts[3].location === '3' &&
            parts[3].direction === 'C'
          ) {
            summary = { type: 'S', location: '2', direction: 'V' };
          } else if (
            parts[1].location === '4' &&
            parts[1].direction === 'C' &&
            parts[3].location === '2' &&
            parts[3].direction === 'A'
          ) {
            summary = { type: 'S', location: '3', direction: 'V' };
          } else if (
            parts[1].location === '3' &&
            parts[1].direction === 'A' &&
            parts[3].location === '1' &&
            parts[3].direction === 'C'
          ) {
            summary = { type: 'S', location: '4', direction: 'V' };
          }
        }
      }
    }

    if (!summary || !summary.type) return null;

    return summary;
  };

  export const create_coordinate = (
    coord: ICoordinate,
    invertY: number
  ): ICoordinateInfo => {
    let { x, y } = coord;
    return create_coord_objects(x, y, invertY);
    // let hasError = x < 0 || y < 0;
    // if (_.isNil(x) || _.isNil(y)) {
    //   x = x || 0;
    //   y = y || 0;
    //   hasError = true;
    // }

    // const invertedCoord = _.isNil(invertY) ? { x, y } : { x, y: invertY - y };

    // return {
    //   coord: { x, y },
    //   invertedCoord: invertedCoord,
    //   isError: hasError,
    // };
  };
  export const create_segpart_info = (source: ISegmentPart) => {
    /* Segpart chart ---------------------------
      type        90  180 S
      -----------------------
      location    Q1  T   Q1
                  Q2  B   Q2
                  Q3  L   Q3
                  Q4  R   Q4
      direction   C   C   H
                  COUNTER_CLOCK  COUNTER_CLOCK  V

      * C : CLOCK, COUNTER_CLOCK : COUNTER_CLOCK

      * direction, location are coming as screen geometry
        you need to convert it to actual geometry
      --------------------------------------------*/
    const infos = [];
    let straight_portion;

    const {
      type,
      direction,
      location,
      coordFrom: { coord: coordFrom },
      coordTo: { coord: coordTo },
    } = source;
    const dir_value = direction === 'C' ? 1 : -1;

    if (type === 'E') {
      let part1: any = {},
        part2: any = {},
        part3: any = {};
      let width, height;
      let from, to;

      // Calculate width and height
      width = Math.abs(coordTo.x - coordFrom.x);
      height = Math.abs(coordTo.y - coordFrom.y);

      // Set straight part's portion
      straight_portion = 0.3;

      // Pre calculate segpart point that connected with start point
      from = {};
      from.x = coordFrom.x;
      from.y = coordFrom.y;

      part1.from = from;

      if (location === '1') {
        // #1 straight ---
        to = {};

        if (direction === 'C') {
          to.x = from.x + width * straight_portion;
          to.y = from.y;
        } else {
          to.x = from.x;
          to.y = from.y - height * straight_portion;
        }

        part1.to = to;
        part1.type = 'D';
        part1.location = null;
        if (direction === 'C') {
          part1.direction = 'R';
        } else {
          part1.direction = 'T';
        }

        // #2 curve ---
        from = {};
        to = {};

        from = part1.to;
        if (direction === 'C') {
          to.x = coordTo.x;
          to.y = coordTo.y - height * straight_portion;
        } else {
          to.x = coordTo.x + width * straight_portion;
          to.y = coordTo.y;
        }

        part2.from = from;
        part2.to = to;
        part2.type = 'E';
        part2.location = location;
        part2.direction = direction;

        // #3 straight ---
        from = {};
        from = part2.to;
        to = {};
        to.x = coordTo.x;
        to.y = coordTo.y;

        // set value
        part3.from = from;
        part3.to = to;
        part3.type = 'D';
        part3.location = null;
        if (direction === 'C') {
          part3.direction = 'B';
        } else {
          part3.direction = 'L';
        }
      } else if (location === '2') {
        // #1 straight ---
        to = {};

        if (direction === 'C') {
          to.x = from.x;
          to.y = from.y - height * straight_portion;
        } else {
          to.x = from.x - width * straight_portion;
          to.y = from.y;
        }

        part1.to = to;
        part1.type = 'D';
        part1.location = null;
        if (direction === 'C') {
          part1.direction = 'T';
        } else {
          part1.direction = 'L';
        }

        // #2 curve ---
        from = {};
        to = {};

        from = part1.to;
        if (direction === 'C') {
          to.x = coordTo.x - width * straight_portion;
          to.y = coordTo.y;
        } else {
          to.x = coordTo.x;
          to.y = coordTo.y - height * straight_portion;
        }

        part2.from = from;
        part2.to = to;
        part2.type = 'E';
        part2.location = location;
        part2.direction = direction;

        // #3 straight ---
        from = {};
        from = part2.to;
        to = {};
        to.x = coordTo.x;
        to.y = coordTo.y;

        // set value
        part3.from = from;
        part3.to = to;
        part3.type = 'D';
        part3.location = null;
        if (direction === 'C') {
          part3.direction = 'R';
        } else {
          part3.direction = 'B';
        }
      } else if (location === '3') {
        // #1 straight ---
        to = {};

        if (direction === 'C') {
          to.x = from.x - width * straight_portion;
          to.y = from.y;
        } else {
          to.x = from.x;
          to.y = from.y + height * straight_portion;
        }

        part1.to = to;
        part1.type = 'D';
        part1.location = null;
        if (direction === 'C') {
          part1.direction = 'L';
        } else {
          part1.direction = 'B';
        }

        // #2 curve ---
        from = {};
        to = {};

        from = part1.to;
        if (direction === 'C') {
          to.x = coordTo.x;
          to.y = coordTo.y + height * straight_portion;
        } else {
          to.x = coordTo.x - width * straight_portion;
          to.y = coordTo.y;
        }

        part2.from = from;
        part2.to = to;
        part2.type = 'E';
        part2.location = location;
        part2.direction = direction;

        // #3 straight ---
        from = {};
        from = part2.to;
        to = {};
        to.x = coordTo.x;
        to.y = coordTo.y;

        // set value
        part3.from = from;
        part3.to = to;
        part3.type = 'D';
        part3.location = null;
        if (direction === 'C') {
          part3.direction = 'T';
        } else {
          part3.direction = 'R';
        }
      } else if (location === '4') {
        // #1 straight ---
        to = {};

        if (direction === 'C') {
          to.x = from.x;
          to.y = from.y + height * straight_portion;
        } else {
          to.x = from.x + width * straight_portion;
          to.y = from.y;
        }

        part1.to = to;
        part1.type = 'D';
        part1.location = null;
        if (direction === 'C') {
          part1.direction = 'B';
        } else {
          part1.direction = 'R';
        }

        // #2 curve ---
        from = {};
        to = {};

        from = part1.to;
        if (direction === 'C') {
          to.x = coordTo.x + width * straight_portion;
          to.y = coordTo.y;
        } else {
          to.x = coordTo.x;
          to.y = coordTo.y + height * straight_portion;
        }

        part2.from = from;
        part2.to = to;
        part2.type = 'E';
        part2.location = location;
        part2.direction = direction;

        // #3 straight ---
        from = {};
        from = part2.to;
        to = {};
        to.x = coordTo.x;
        to.y = coordTo.y;

        // set value
        part3.from = from;
        part3.to = to;
        part3.type = 'D';
        part3.location = null;
        if (direction === 'C') {
          part3.direction = 'L';
        } else {
          part3.direction = 'T';
        }
      }

      infos.push(part1);
      infos.push(part2);
      infos.push(part3);
    } else if (type === 'U') {
      let part1: any = {},
        part2: any = {},
        part3: any = {},
        part4: any = {},
        part5: any = {};
      let width, height;
      let from, to;

      // Calculate width and height
      width = Math.abs(coordTo.x - coordFrom.x);
      height = Math.abs(coordTo.y - coordFrom.y);

      // Set straight part's portion
      straight_portion = 0.2;

      // Pre calculate segpart point that connected with start point
      from = {};
      from.x = coordFrom.x;
      from.y = coordFrom.y;

      part1.from = from;

      if (location === 'T') {
        // #1 straight ---
        to = {};

        to.x = from.x;
        to.y = from.y - width * straight_portion;

        part1.to = to;
        part1.type = 'D';
        part1.location = null;
        if (direction === 'C') {
          part1.direction = 'T';
        } else {
          part1.direction = 'T';
        }

        // #2 curve ---
        from = {};
        to = {};

        from = part1.to;
        to.x = coordFrom.x + width * (0.5 - straight_portion * 0.5) * dir_value;
        to.y =
          coordFrom.y > coordTo.y
            ? coordTo.y - width * 0.5
            : coordFrom.y - width * 0.5;

        part2.from = from;
        part2.to = to;
        part2.type = 'E';
        part2.location = direction === 'C' ? '2' : '1';
        part2.direction = direction;

        // #3 straight ---
        from = {};
        to = {};

        from = part2.to;
        to.x = coordFrom.x + width * (0.5 + straight_portion * 0.5) * dir_value;
        to.y =
          coordFrom.y > coordTo.y
            ? coordTo.y - width * 0.5
            : coordFrom.y - width * 0.5;

        part3.from = from;
        part3.to = to;
        part3.type = 'D';
        part3.location = null;
        if (direction === 'C') {
          part3.direction = 'R';
        } else {
          part3.direction = 'L';
        }

        // #4 curve ---
        from = {};
        to = {};

        from = part3.to;
        to.x = coordTo.x;
        to.y = coordTo.y - width * straight_portion;

        part4.from = from;
        part4.to = to;
        part4.type = 'E';
        part4.location = direction === 'C' ? '1' : '2';
        part4.direction = direction;

        // #5 straight ---
        from = {};
        from = part4.to;
        to = {};
        to.x = coordTo.x;
        to.y = coordTo.y;

        // set value
        part5.from = from;
        part5.to = to;
        part5.type = 'D';
        part5.location = null;
        if (direction === 'C') {
          part5.direction = 'B';
        } else {
          part5.direction = 'B';
        }
      } else if (location === 'R') {
        // #1 straight ---
        to = {};

        to.x = from.x + height * straight_portion;
        to.y = from.y;

        part1.to = to;
        part1.type = 'D';
        part1.location = null;
        if (direction === 'C') {
          part1.direction = 'R';
        } else {
          part1.direction = 'R';
        }

        // #2 curve ---
        from = {};
        to = {};

        from = part1.to;
        to.x =
          coordFrom.x > coordTo.x
            ? coordFrom.x + height * 0.5
            : coordTo.x + height * 0.5;
        to.y =
          coordFrom.y + height * (0.5 - straight_portion * 0.5) * dir_value;

        part2.from = from;
        part2.to = to;
        part2.type = 'E';
        part2.location = direction === 'C' ? '1' : '4';
        part2.direction = direction;

        // #3 straight ---
        from = {};
        to = {};

        from = part2.to;
        to.x =
          coordFrom.x > coordTo.x
            ? coordFrom.x + height * 0.5
            : coordTo.x + height * 0.5;
        to.y =
          coordFrom.y + height * (0.5 + straight_portion * 0.5) * dir_value;

        part3.from = from;
        part3.to = to;
        part3.type = 'D';
        part3.location = null;
        if (direction === 'C') {
          part3.direction = 'B';
        } else {
          part3.direction = 'T';
        }

        // #4 curve ---
        from = {};
        to = {};

        from = part3.to;
        to.x = coordTo.x + height * straight_portion;
        to.y = coordTo.y;

        part4.from = from;
        part4.to = to;
        part4.type = 'E';
        part4.location = direction === 'C' ? '4' : '1';
        part4.direction = direction;

        // #5 straight ---
        from = {};
        from = part4.to;
        to = {};
        to.x = coordTo.x;
        to.y = coordTo.y;

        // set value
        part5.from = from;
        part5.to = to;
        part5.type = 'D';
        part5.location = null;
        if (direction === 'C') {
          part5.direction = 'L';
        } else {
          part5.direction = 'L';
        }
      } else if (location === 'B') {
        // #1 straight ---
        to = {};

        to.x = from.x;
        to.y = from.y + width * straight_portion;

        part1.to = to;
        part1.type = 'D';
        part1.location = null;
        if (direction === 'C') {
          part1.direction = 'B';
        } else {
          part1.direction = 'B';
        }

        // #2 curve ---
        from = {};
        to = {};

        from = part1.to;
        to.x = coordFrom.x - width * (0.5 - straight_portion * 0.5) * dir_value;
        to.y =
          coordFrom.y > coordTo.y
            ? coordFrom.y + width * 0.5
            : coordTo.y + width * 0.5;

        part2.from = from;
        part2.to = to;
        part2.type = 'E';
        part2.location = direction === 'C' ? '4' : '3';
        part2.direction = direction;

        // #3 straight ---
        from = {};
        to = {};

        from = part2.to;
        to.x = coordFrom.x - width * (0.5 + straight_portion * 0.5) * dir_value;
        to.y =
          coordFrom.y > coordTo.y
            ? coordFrom.y + width * 0.5
            : coordTo.y + width * 0.5;

        part3.from = from;
        part3.to = to;
        part3.type = 'D';
        part3.location = null;
        if (direction === 'C') {
          part3.direction = 'L';
        } else {
          part3.direction = 'R';
        }

        // #4 curve ---
        from = {};
        to = {};

        from = part3.to;
        to.x = coordTo.x;
        to.y = coordTo.y + width * straight_portion;

        part4.from = from;
        part4.to = to;
        part4.type = 'E';
        part4.location = direction === 'C' ? '3' : '4';
        part4.direction = direction;

        // #5 straight ---
        from = {};
        from = part4.to;
        to = {};
        to.x = coordTo.x;
        to.y = coordTo.y;

        // set value
        part5.from = from;
        part5.to = to;
        part5.type = 'D';
        part5.location = null;
        if (direction === 'C') {
          part5.direction = 'T';
        } else {
          part5.direction = 'T';
        }
      } else if (location === 'L') {
        // #1 straight ---
        to = {};

        to.x = from.x - height * straight_portion;
        to.y = from.y;

        part1.to = to;
        part1.type = 'D';
        part1.location = null;
        if (direction === 'C') {
          part1.direction = 'L';
        } else {
          part1.direction = 'L';
        }

        // #2 curve ---
        from = {};
        to = {};

        from = part1.to;
        to.x =
          coordFrom.x > coordTo.x
            ? coordTo.x - height * 0.5
            : coordFrom.x - height * 0.5;
        to.y =
          coordFrom.y - height * (0.5 - straight_portion * 0.5) * dir_value;

        part2.from = from;
        part2.to = to;
        part2.type = 'E';
        part2.location = direction === 'C' ? '3' : '2';
        part2.direction = direction;

        // #3 straight ---
        from = {};
        to = {};

        from = part2.to;
        to.x =
          coordFrom.x > coordTo.x
            ? coordTo.x - height * 0.5
            : coordFrom.x - height * 0.5;
        to.y =
          coordFrom.y - height * (0.5 + straight_portion * 0.5) * dir_value;

        part3.from = from;
        part3.to = to;
        part3.type = 'D';
        part3.location = null;
        if (direction === 'C') {
          part3.direction = 'T';
        } else {
          part3.direction = 'B';
        }

        // #4 curve ---
        from = {};
        to = {};

        from = part3.to;
        to.x = coordTo.x - height * straight_portion;
        to.y = coordTo.y;

        part4.from = from;
        part4.to = to;
        part4.type = 'E';
        part4.location = direction === 'C' ? '2' : '3';
        part4.direction = direction;

        // #5 straight ---
        from = {};
        from = part4.to;
        to = {};
        to.x = coordTo.x;
        to.y = coordTo.y;

        // set value
        part5.from = from;
        part5.to = to;
        part5.type = 'D';
        part5.location = null;
        if (direction === 'C') {
          part5.direction = 'R';
        } else {
          part5.direction = 'R';
        }
      }

      infos.push(part1);
      infos.push(part2);
      infos.push(part3);
      infos.push(part4);
      infos.push(part5);
    } else if (type === 'S') {
      let part1: any = {},
        part2: any = {},
        part3: any = {},
        part4: any = {},
        part5: any = {};
      let width, height;
      let from, to;

      // Calculate width and height
      width = Math.abs(coordTo.x - coordFrom.x);
      height = Math.abs(coordTo.y - coordFrom.y);

      // Set straight part's portion
      straight_portion = 0.3;

      // Pre calculate segpart point that connected with start point
      from = {};
      from.x = coordFrom.x;
      from.y = coordFrom.y;

      part1.from = from;

      if (location === '1') {
        // #1 straight ---
        to = {};

        if (direction === 'H') {
          to.x = from.x + width * straight_portion;
          to.y = from.y;
        } else {
          to.x = from.x;
          to.y = from.y - height * straight_portion;
        }

        part1.to = to;
        part1.type = 'D';
        part1.location = null;
        part1.direction = detect_direction(part1.from, part1.to);

        // #2 curve ---
        from = {};
        to = {};

        from = part1.to;
        if (direction === 'H') {
          to.x = coordFrom.x + width * 0.5;
          to.y = coordFrom.y - height * (0.5 - straight_portion * 0.5);
        } else {
          to.x = coordFrom.x + width * (0.5 - straight_portion * 0.5);
          to.y = coordFrom.y - height * 0.5;
        }

        part2.from = from;
        part2.to = to;
        part2.type = 'E';
        part2.location = direction === 'H' ? '4' : '2';
        part2.direction = direction === 'H' ? 'A' : 'C';

        // #3 straight ---
        from = {};
        to = {};

        from = part2.to;
        if (direction === 'H') {
          to.x = coordFrom.x + width * 0.5;
          to.y = coordFrom.y - height * (0.5 + straight_portion * 0.5);
        } else {
          to.x = coordFrom.x + width * (0.5 + straight_portion * 0.5);
          to.y = coordFrom.y - height * 0.5;
        }

        part3.from = from;
        part3.to = to;
        part3.type = 'D';
        part3.location = null;
        part3.direction = detect_direction(part3.from, part3.to);

        // #4 curve ---
        from = {};
        to = {};

        from = part3.to;
        if (direction === 'H') {
          to.x = coordTo.x - width * straight_portion;
          to.y = coordTo.y;
        } else {
          to.x = coordTo.x;
          to.y = coordTo.y + height * straight_portion;
        }

        part4.from = from;
        part4.to = to;
        part4.type = 'E';
        part4.location = direction === 'H' ? '2' : '4';
        part4.direction = direction === 'H' ? 'C' : 'A';

        // #5 straight ---
        from = {};
        from = part4.to;
        to = {};
        to.x = coordTo.x;
        to.y = coordTo.y;

        // set value
        part5.from = from;
        part5.to = to;
        part5.type = 'D';
        part5.location = null;
        part5.direction = detect_direction(part5.from, part5.to);
      } else if (location === '2') {
        // #1 straight ---
        to = {};

        if (direction === 'H') {
          to.x = from.x - width * straight_portion;
          to.y = from.y;
        } else {
          to.x = from.x;
          to.y = from.y - height * straight_portion;
        }

        part1.to = to;
        part1.type = 'D';
        part1.location = null;
        if (direction === 'H') {
          part1.direction = 'L';
        } else {
          part1.direction = 'T';
        }

        // #2 curve ---
        from = {};
        to = {};

        from = part1.to;
        if (direction === 'H') {
          to.x = coordFrom.x - width * 0.5;
          to.y = coordFrom.y - height * (0.5 - straight_portion * 0.5);
        } else {
          to.x = coordFrom.x - width * (0.5 - straight_portion * 0.5);
          to.y = coordFrom.y - height * 0.5;
        }

        part2.from = from;
        part2.to = to;
        part2.type = 'E';
        part2.location = direction === 'H' ? '3' : '1';
        part2.direction = direction === 'H' ? 'C' : 'A';

        // #3 straight ---
        from = {};
        to = {};

        from = part2.to;
        if (direction === 'H') {
          to.x = coordFrom.x - width * 0.5;
          to.y = coordFrom.y - height * (0.5 + straight_portion * 0.5);
        } else {
          to.x = coordFrom.x - width * (0.5 + straight_portion * 0.5);
          to.y = coordFrom.y - height * 0.5;
        }

        part3.from = from;
        part3.to = to;
        part3.type = 'D';
        part3.location = null;
        if (direction === 'H') {
          part3.direction = 'T';
        } else {
          part3.direction = 'L';
        }

        // #4 curve ---
        from = {};
        to = {};

        from = part3.to;
        if (direction === 'H') {
          to.x = coordTo.x + width * straight_portion;
          to.y = coordTo.y;
        } else {
          to.x = coordTo.x;
          to.y = coordTo.y + height * straight_portion;
        }

        part4.from = from;
        part4.to = to;
        part4.type = 'E';
        part4.location = direction === 'H' ? '1' : '3';
        part4.direction = direction === 'H' ? 'A' : 'C';

        // #5 straight ---
        from = {};
        from = part4.to;
        to = {};
        to.x = coordTo.x;
        to.y = coordTo.y;

        // set value
        part5.from = from;
        part5.to = to;
        part5.type = 'D';
        part5.location = null;
        if (direction === 'H') {
          part5.direction = 'L';
        } else {
          part5.direction = 'T';
        }
      } else if (location === '3') {
        // #1 straight ---
        to = {};

        if (direction === 'H') {
          to.x = from.x - width * straight_portion;
          to.y = from.y;
        } else {
          to.x = from.x;
          to.y = from.y + height * straight_portion;
        }

        part1.to = to;
        part1.type = 'D';
        part1.location = null;
        if (direction === 'H') {
          part1.direction = 'L';
        } else {
          part1.direction = 'B';
        }

        // #2 curve ---
        from = {};
        to = {};

        from = part1.to;
        if (direction === 'H') {
          to.x = coordFrom.x - width * 0.5;
          to.y = coordFrom.y + height * (0.5 - straight_portion * 0.5);
        } else {
          to.x = coordFrom.x - width * (0.5 - straight_portion * 0.5);
          to.y = coordFrom.y + height * 0.5;
        }

        part2.from = from;
        part2.to = to;
        part2.type = 'E';
        part2.location = direction === 'H' ? '2' : '4';
        part2.direction = direction === 'H' ? 'A' : 'C';

        // #3 straight ---
        from = {};
        to = {};

        from = part2.to;
        if (direction === 'H') {
          to.x = coordFrom.x - width * 0.5;
          to.y = coordFrom.y + height * (0.5 + straight_portion * 0.5);
        } else {
          to.x = coordFrom.x - width * (0.5 + straight_portion * 0.5);
          to.y = coordFrom.y + height * 0.5;
        }

        part3.from = from;
        part3.to = to;
        part3.type = 'D';
        part3.location = null;
        if (direction === 'H') {
          part3.direction = 'B';
        } else {
          part3.direction = 'L';
        }

        // #4 curve ---
        from = {};
        to = {};

        from = part3.to;
        if (direction === 'H') {
          to.x = coordTo.x + width * straight_portion;
          to.y = coordTo.y;
        } else {
          to.x = coordTo.x;
          to.y = coordTo.y - height * straight_portion;
        }

        part4.from = from;
        part4.to = to;
        part4.type = 'E';
        part4.location = direction === 'H' ? '4' : '2';
        part4.direction = direction === 'H' ? 'C' : 'A';

        // #5 straight ---
        from = {};
        from = part4.to;
        to = {};
        to.x = coordTo.x;
        to.y = coordTo.y;

        // set value
        part5.from = from;
        part5.to = to;
        part5.type = 'D';
        part5.location = null;
        if (direction === 'H') {
          part5.direction = 'L';
        } else {
          part5.direction = 'B';
        }
      } else if (location === '4') {
        // #1 straight ---
        to = {};

        if (direction === 'H') {
          to.x = from.x + width * straight_portion;
          to.y = from.y;
        } else {
          to.x = from.x;
          to.y = from.y + height * straight_portion;
        }

        part1.to = to;
        part1.type = 'D';
        part1.location = null;
        if (direction === 'H') {
          part1.direction = 'R';
        } else {
          part1.direction = 'B';
        }

        // #2 curve ---
        from = {};
        to = {};

        from = part1.to;
        if (direction === 'H') {
          to.x = coordFrom.x + width * 0.5;
          to.y = coordFrom.y + height * (0.5 - straight_portion * 0.5);
        } else {
          to.x = coordFrom.x + width * (0.5 - straight_portion * 0.5);
          to.y = coordFrom.y + height * 0.5;
        }

        part2.from = from;
        part2.to = to;
        part2.type = 'E';
        part2.location = direction === 'H' ? '1' : '3';
        part2.direction = direction === 'H' ? 'C' : 'A';

        // #3 straight ---
        from = {};
        to = {};

        from = part2.to;
        if (direction === 'H') {
          to.x = coordFrom.x + width * 0.5;
          to.y = coordFrom.y + height * (0.5 + straight_portion * 0.5);
        } else {
          to.x = coordFrom.x + width * (0.5 + straight_portion * 0.5);
          to.y = coordFrom.y + height * 0.5;
        }

        part3.from = from;
        part3.to = to;
        part3.type = 'D';
        part3.location = null;
        if (direction === 'H') {
          part3.direction = 'B';
        } else {
          part3.direction = 'R';
        }

        // #4 curve ---
        from = {};
        to = {};

        from = part3.to;
        if (direction === 'H') {
          to.x = coordTo.x - width * straight_portion;
          to.y = coordTo.y;
        } else {
          to.x = coordTo.x;
          to.y = coordTo.y - height * straight_portion;
        }

        part4.from = from;
        part4.to = to;
        part4.type = 'E';
        part4.location = direction === 'H' ? '3' : '1';
        part4.direction = direction === 'H' ? 'A' : 'C';

        // #5 straight ---
        from = {};
        from = part4.to;
        to = {};
        to.x = coordTo.x;
        to.y = coordTo.y;

        // set value
        part5.from = from;
        part5.to = to;
        part5.type = 'D';
        part5.location = null;
        if (direction === 'H') {
          part5.direction = 'R';
        } else {
          part5.direction = 'B';
        }
      }

      infos.push(part1);
      infos.push(part2);
      infos.push(part3);
      infos.push(part4);
      infos.push(part5);
    }

    return infos;
  };

  export const invert_geometry = (location: string, direction: string) => {
    let geometry: { location?: string; direction?: string } = {};

    geometry.location = location;
    geometry.direction = direction;

    // Invert segment location, because screen is inverted
    if (location === '1') {
      geometry.location = '4';
    } else if (location === '2') {
      geometry.location = '3';
    } else if (location === '3') {
      geometry.location = '2';
    } else if (location === '4') {
      geometry.location = '1';
    } else if (location === 'T') {
      geometry.location = 'B';
    } else if (location === 'B') {
      geometry.location = 'T';
    }

    if (direction === 'C') {
      geometry.direction = 'A';
    } else if (direction === 'A') {
      geometry.direction = 'C';
    } else if (direction === 'T') {
      geometry.direction = 'B';
    } else if (direction === 'B') {
      geometry.direction = 'T';
    }

    return geometry;
  };

  export const get_bezier_matrix = (
    direction: string,
    type: string,
    quadrant: string
  ): number[] => {
    if (direction == 'A') {
      return BEZIER_MATRIX[`D_${type}_A`][`${quadrant}`];
    } else {
      return BEZIER_MATRIX[`D_${type}`][`${quadrant}`];
    }
  };

  export const find_segment_candidate = (
    segmentId: number,
    startPoint: any,
    endPoint: any,
    segments: any[]
  ) => {
    let candidates = [];

    let start_end_dir;

    let con_start_edge_segparts = [];
    let con_end_edge_segparts = [];

    // Detect direction between start and end point
    start_end_dir = detect_direction(startPoint.coord, endPoint.coord);

    // Find start point's connected segments then get its last segpart
    let connected_segments = find_connected_segments(
      startPoint.id,
      endPoint.id,
      segments
    ) as {
      start: any[];
      end: any[];
    };

    for (let i = 0; i < connected_segments.start.length; i++) {
      if (connected_segments.start[i].id !== segmentId) {
        let matched_segpart = find_segpart(
          startPoint.coord,
          connected_segments.start[i].segmentParts
        );
        if (matched_segpart) {
          con_start_edge_segparts.push(matched_segpart);
        }
      }
    }

    for (let i = 0; i < connected_segments.end.length; i++) {
      if (connected_segments.end[i].id !== segmentId) {
        let matched_segpart = find_segpart(
          endPoint.coord,
          connected_segments.end[i].segmentParts
        );
        if (matched_segpart) {
          con_end_edge_segparts.push(matched_segpart);
        }
      }
    }

    // Find direction match case
    for (let i = 0; i < SEGPART_DEFINITION.length; i++) {
      let segment = SEGPART_DEFINITION[i];

      let start_match = false;
      let end_match = false;

      if (con_start_edge_segparts.length > 0) {
        if (
          con_start_edge_segparts.find(
            (edge_part) => edge_part.direction === segment.segpart[0].direction
          )
        ) {
          start_match = true;
        }
      } else {
        start_match = true;
      }

      if (con_end_edge_segparts.length > 0) {
        if (
          con_end_edge_segparts.find(
            (edge_part) =>
              edge_part.direction ===
              segment.segpart[segment.segpart.length - 1].direction
          )
        ) {
          end_match = true;
        }
      } else {
        end_match = true;
      }

      let is_candidate = false;

      // check if the edge's direction is matched
      if (start_match && end_match) {
        /*
            check if the summary direction is matched
            EXACT MATCH : STRAIGHT, 90, S
            TOP/DOWN MMATCH : 180
            */
        if (segment.type === 'U') {
          if (
            start_end_dir &&
            start_end_dir.includes(segment.start_end_dir[0])
          ) {
            is_candidate = true;
          }
        } else {
          if (start_end_dir && start_end_dir === segment.start_end_dir) {
            is_candidate = true;
          }
        }
      }

      if (is_candidate) {
        add_candidate(
          candidates,
          segment.type,
          segment.location,
          segment.direction,
          true
        );
      }
    }

    // if there is no candidate then add irregular straight line
    if (candidates.length === 0) {
      add_candidate(candidates, 'D', null, start_end_dir, false);

      console.warn(
        `can't find candidate, use non-regular segment for ${segmentId}`
      );
    }

    return candidates;
  };

  export const find_connected_segments = (
    start_point_id: any,
    end_point_id: any,
    segments: any,
    return_type?,
    need_copied_object?
  ) => {
    let start = [];
    let end = [];

    for (let i = 0; i < segments.length; i++) {
      let segment = segments[i];

      if (
        start_point_id &&
        (segment.pointTo.id === start_point_id ||
          segment.pointFrom.id === start_point_id)
      ) {
        if (need_copied_object) {
          // Return as copy() object
          start.push(segment.copy());
        } else {
          start.push(segment);
        }
      } else if (
        end_point_id &&
        (segment.pointTo.id === end_point_id ||
          segment.pointFrom.id === end_point_id)
      ) {
        if (need_copied_object) {
          // Return as copy() object
          end.push(segment.copy());
        } else {
          end.push(segment);
        }
      }
    }

    // return result in array form or object form
    if (return_type === 'ARRAY') {
      return start.concat(end);
    } else {
      return { start, end };
    }
  };
  export const find_segpart = (target_coord, segparts) => {
    let result;

    for (let i = 0; i < segparts.length; i++) {
      let segpart = segparts[i];

      // if any segpart's coord is matched with target coord
      if (
        (segpart.coordFrom.coord.x === target_coord.x &&
          segpart.coordFrom.coord.y === target_coord.y) ||
        (segpart.coordTo.coord.x === target_coord.x &&
          segpart.coordTo.coord.y === target_coord.y)
      ) {
        result = segpart;
        break;
      }
    }

    return result;
  };

  export function check_segment_validation(
    type,
    location,
    direction,
    candidates: any[],
    segparts
  ) {
    let is_candidate_validate;
    let is_part_validate = true;
    let candidate_validate_msg;
    let part_validate_msg;

    // Candidate check
    if (
      candidates.some(
        (candidate) =>
          candidate.isValidate &&
          candidate.type === type &&
          candidate.location === location &&
          candidate.direction === direction
      )
    ) {
      is_candidate_validate = true;
    } else {
      is_candidate_validate = false;
      candidate_validate_msg = `bad direction of segment : current segment ${type} ${location} ${direction} is not matched with connected segment`;
    }

    // Parts composition check
    let length = segparts.length;

    if (length === 1) {
      // STRAIGHT
      if (segparts[0].type !== 'D') {
        is_part_validate = false;
      }
    } else if (length === 3) {
      // 90
      if (
        !(
          segparts[0].type === 'D' &&
          segparts[1].type === 'E' &&
          segparts[2].type === 'D'
        )
      ) {
        is_part_validate = false;
      }
    } else if (length === 5) {
      // 180, S
      if (
        !(
          segparts[0].type === 'D' &&
          segparts[1].type === 'E' &&
          segparts[2].type === 'D' &&
          segparts[3].type === 'E' &&
          segparts[4].type === 'D'
        )
      ) {
        is_part_validate = false;
      }
    } else {
      is_part_validate = false;
    }

    if (!is_part_validate) {
      part_validate_msg = `bad definition for segment : found  ${length} segment parts, but only 1, 3, or 5 are permitted`;
    }

    return {
      is_candidate_validate,
      is_part_validate,
      candidate_validate_msg,
      part_validate_msg,
    };
  }

  export function find_max_and_min_of_objects(objects, coord_type) {
    if (!Array.isArray(objects)) {
      objects = [objects];
    }

    if (coord_type === 'INVERTED') {
      coord_type = 'invertedCoord';
    } else {
      coord_type = 'coord';
    }

    if (!objects || objects.length <= 0) {
      return {
        max: {
          x: 0,
          y: 0,
        },
        min: {
          x: 0,
          y: 0,
        },
      };
    }

    let minX, minY, maxX, maxY;

    for (let object of objects) {
      if (object.constructor.name.toUpperCase() !== 'CLUSTER') {
        // if (object instanceof Cluster) {
        // Valid first candidate for min max values
        if (object.constructor.name.toUpperCase() === 'SEGMENT') {
          // if (object instanceof Segment) {
          let cur_from = object.pointFrom[coord_type];
          let cur_to = object.pointTo[coord_type];
          minX = cur_from.x < cur_to.x ? cur_from.x : cur_to.x;
          maxX = cur_from.x > cur_to.x ? cur_from.x : cur_to.x;
          minY = cur_from.y < cur_to.y ? cur_from.y : cur_to.y;
          maxY = cur_from.y > cur_to.y ? cur_from.y : cur_to.y;
        } else {
          (minX = object[coord_type].x),
            (minY = object[coord_type].y),
            (maxX = object[coord_type].x),
            (maxY = object[coord_type].y);
        }
        break;
      }
    }

    for (let object in objects) {
      let obj = objects[object];
      if (obj.constructor.name.toUpperCase() === 'CLUSTER') {
        // if (obj instanceof Cluster) {
        continue;
      } else {
        if (obj.constructor.name.toUpperCase() === 'SEGMENT') {
          // if (obj instanceof Segment) {
          maxX =
            obj.pointTo[coord_type].x > maxX ? obj.pointTo[coord_type].x : maxX;
          maxY =
            obj.pointTo[coord_type].y > maxY ? obj.pointTo[coord_type].y : maxY;
          minY =
            obj.pointTo[coord_type].y < minY ? obj.pointTo[coord_type].y : minY;
          minX =
            obj.pointTo[coord_type].x < minX ? obj.pointTo[coord_type].x : minX;

          maxX = obj.dirCoord.x > maxX ? obj.dirCoord.x : maxX;
          maxY = obj.dirCoord.y > maxY ? obj.dirCoord.y : maxY;
          minY = obj.dirCoord.y < minY ? obj.dirCoord.y : minY;
          minX = obj.dirCoord.x < minX ? obj.dirCoord.x : minX;

          maxX =
            obj.pointFrom[coord_type].x > maxX
              ? obj.pointFrom[coord_type].x
              : maxX;
          maxY =
            obj.pointFrom[coord_type].y > maxY
              ? obj.pointFrom[coord_type].y
              : maxY;
          minY =
            obj.pointFrom[coord_type].y < minY
              ? obj.pointFrom[coord_type].y
              : minY;
          minX =
            obj.pointFrom[coord_type].x < minX
              ? obj.pointFrom[coord_type].x
              : minX;
        } else {
          maxX = obj[coord_type].x > maxX ? obj[coord_type].x : maxX;
          maxY = obj[coord_type].y > maxY ? obj[coord_type].y : maxY;
          minY = obj[coord_type].y < minY ? obj[coord_type].y : minY;
          minX = obj[coord_type].x < minX ? obj[coord_type].x : minX;
        }
      }
    }
    return {
      max: {
        x: maxX,
        y: maxY,
      },
      min: {
        x: minX,
        y: minY,
      },
    };
  }

  export function find_location_object_direction_at_point(
    pointId: number,
    all_segments: any[]
  ) {
    let direction;

    // Get all the segments the location is on
    const found_segment = find_connected_segments(
      pointId,
      null,
      all_segments,
      'ARRAY',
      false
    ) as any[];
    let start_or_end;

    let target_segment: ISegment;
    if (found_segment && found_segment.length > 0) {
      target_segment = found_segment[0];
    } else {
      target_segment = null;
    }

    // Find direction of the segment

    if (target_segment) {
      //Find whether target segment is leading to the point or going away from the point
      if (target_segment.pointFrom.id === pointId) {
        start_or_end = 'START';
      } else {
        start_or_end = 'END';
      }

      // All segment must start with a staright seg part by definition
      if (start_or_end === 'START') {
        direction = target_segment.segmentParts[0].direction;
      } else {
        direction =
          target_segment.segmentParts[target_segment.segmentParts.length - 1]
            .direction;
      }
    } else {
      console.warn(`Target segment was not found for station id: ${pointId}`);

      // Set direction to the orientation of the viewport
      direction = 'B';
    }

    // set the inverted direction to match the inversion of the map
    if (direction === 'T') {
      direction = 'B';
    } else if (direction === 'B') {
      direction = 'T';
    }

    return direction;
  }

  export function get_location_object_direction_offset(
    object_direction,
    segmentDirection,
    object_type
  ) {
    let offset_object = {
      x: 0,
      y: 0,
    };

    let padding = 5;
    let offset_length = main_css[object_type.toLowerCase()].width + padding;
    let alternation_multiplier;

    if (segmentDirection === 'T') {
      alternation_multiplier =
        object_direction === 'L' ? -1 : object_direction === 'R' ? 1 : 0;
      offset_object.x = offset_length * alternation_multiplier;
    } else if (segmentDirection === 'B') {
      alternation_multiplier =
        object_direction === 'L' ? 1 : object_direction === 'R' ? -1 : 0;
      offset_object.x = offset_length * alternation_multiplier;
    } else if (segmentDirection === 'R') {
      alternation_multiplier =
        object_direction === 'L' ? -1 : object_direction === 'R' ? 1 : 0; // has to go negative in order to move up on the screen
      offset_object.y = offset_length * alternation_multiplier;
    } else if (segmentDirection === 'L') {
      alternation_multiplier =
        object_direction === 'L' ? 1 : object_direction === 'R' ? -1 : 0; // has to go positive in order to move down on the screen
      offset_object.y = offset_length * alternation_multiplier;
    }

    return offset_object;
  }

  export function calc_snap_coord(coord, snap_distance) {
    let snap_coord: any = {};
    let snap_factor;

    if (snap_distance === 0) {
      return coord;
    } else {
      snap_factor = snap_distance;

      snap_coord.x = Math.round(coord.x / snap_factor) * snap_factor;
      snap_coord.y = Math.round(coord.y / snap_factor) * snap_factor;

      return snap_coord;
    }
  }

  export function find_all_contigous_segments_from_points(
    pointIdList,
    segmentsList
  ) {
    let found_segments = [];
    for (let i = 0; i < pointIdList.length; i++) {
      let pointFrom = parseInt(pointIdList[i]);
      for (let j = 0; j < segmentsList.length; j++) {
        let current_segment = segmentsList[j];
        if (current_segment.pointFrom.id === pointFrom) {
          let pointTo = current_segment.pointTo.id;
          for (let k = 0; k < pointIdList.length; k++) {
            if (parseInt(pointIdList[k]) === pointTo) {
              found_segments.push(current_segment);
            }
          }
        }
      }
    }

    return found_segments;
  }
  export function find_connected_segment(point, segments, find_direction?) {
    let connected_segments = [];
    let matched;

    if (find_direction === 'FROM') {
      matched = segments.filter((segment) => segment.pointFrom.id === point.id);
    } else if (find_direction === 'TO') {
      matched = segments.filter((segment) => segment.pointTo.id === point.id);
    } else {
      matched = segments.filter(
        (segment) =>
          segment.pointFrom.id === point.id || segment.pointTo.id === point.id
      );
    }

    if (Array.isArray(matched)) {
      connected_segments = matched;
    } else {
      if (matched) {
        connected_segments.push(matched);
      }
    }

    return connected_segments;
  }

  export function create_coord_objects(x, y, invertFactorY) {
    // Make station object
    let coord: any = {};
    let isError = false;

    // Remove error case
    if (x === undefined || x === null || y === undefined || y === null) {
      x = x === undefined || x === null ? 0 : x;
      y = y === undefined || y === null ? 0 : y;

      isError = true;
    }

    if (x < 0 || y < 0) {
      isError = true;
    }

    // Create coords
    coord.x = x;
    coord.y = y;

    let invertedCoord: any = {};

    if (invertFactorY != null) {
      invertedCoord.x = x;
      invertedCoord.y = invertFactorY - y;
    } else {
      invertedCoord.x = x;
      invertedCoord.y = y;
    }

    return {
      coord,
      invertedCoord,
      isError,
    };
  }

  export function get_segment_speed(type, speed_setting) {
    let speed;
    if (type === 'D') {
      speed = speed_setting.straight;
    } else {
      speed = speed_setting.curve;
    }

    return speed;
  }

  export function find_connected_station(point, stations) {
    let connected_stations = [];

    for (let i = 0; i < stations.length; i++) {
      let station = stations[i];

      if (point.id === station.pointId) {
        connected_stations.push(station);
      }
    }

    return connected_stations;
  }

  export function find_connected_buffer(point, objects) {
    let connected_buffers = find_connected_station(point, objects);

    return connected_buffers;
  }

  export function find_connected_mtl(point, objects) {
    let connected_mtls = find_connected_station(point, objects);

    return connected_mtls;
  }

  export function find_connected_cluster(target_point, clusters) {
    let found_clusters = [];
    found_clusters = clusters.filter((cluster) => {
      if (
        cluster.pointIdList.find((point) => {
          return target_point.id === point;
        })
      ) {
        return cluster;
      }
    });
    return found_clusters;
  }

  export function find_connected_cluster_using_segment(segment, clusters) {
    let found_clusters = [];
    for (let i = 0; i < clusters.length; i++) {
      let points = clusters[i].pointIdList;
      let has_from = points.indexOf(segment.pointFrom.id);
      let has_to = points.indexOf(segment.pointTo.id);
      if (has_from > -1 && has_to > -1) {
        found_clusters.push(clusters[i]);
      }
    }
    return found_clusters;
  }

  export function add_candidate(
    candidates,
    type,
    location,
    direction,
    isValidate
  ) {
    // Create candidate
    let candidate: any = {};
    candidate.type = type;
    candidate.location = location;
    candidate.direction = direction;
    candidate.isValidate = isValidate;

    // Check for redundancy
    if (!check_redundant_candidate(candidates, candidate)) {
      candidates.push(candidate);
    }
  }
  export function check_redundant_candidate(candidates, new_candidate) {
    let is_redundant = false;

    for (let i = 0; i < candidates.length; i++) {
      let candidate = candidates[i];

      if (
        candidate.type === new_candidate.type &&
        candidate.direction === new_candidate.direction &&
        candidate.location === new_candidate.location
      ) {
        is_redundant = true;
        break;
      }
    }

    return is_redundant;
  }

  export function find_segment(
    start_point_id,
    end_point_id,
    segments,
    is_find_multiple_segments
  ) {
    let result;

    if (start_point_id === end_point_id) {
      return null;
    }

    if (is_find_multiple_segments) {
      result = [];
    }

    for (let i = 0; i < segments.length; i++) {
      let segment = segments[i];

      if (
        start_point_id !== null &&
        start_point_id !== undefined &&
        segment.pointFrom.id === start_point_id &&
        end_point_id !== null &&
        end_point_id !== undefined &&
        segment.pointTo.id === end_point_id
      ) {
        if (!is_find_multiple_segments) {
          result = segment;
          break;
        } else {
          result.push(segment);
        }
      }
    }

    return result;
  }
  export function check_duplicated_object(
    stations,
    buffers,
    mtls,
    create_type,
    create_direction,
    base_id
  ) {
    /* ************************************************************************
  Duplication decision table, by Taehun Choi, 190430

  |object_type | duplicapable          | condition|
  ------------------------------------------------------------------------|
  |MTL         | X                     ||
  |station     | /w other station : O  | only if the directions are different|
  |            | /w other buffer : O   | only if the directions are different|
  |            | /w other mtl : X      ||
  |buffer      | /w other station : O  | only if the directions are different|
  |            | /w other buffer : O   | only if the directions are different|
  |            | /w other mtl : X      ||
  ************************************************************************ */
    let mtl_duplication;
    let station_duplication;
    let buffer_duplication;

    let is_duplicated = false;

    // Check each object's duplication by object type
    mtl_duplication = check_duplicated_base_id(mtls, base_id);

    // MTL can't be diplicated with any other object
    if (mtl_duplication.is_duplicated) {
      is_duplicated = true;
    } else {
      station_duplication = check_duplicated_base_id(stations, base_id);
      buffer_duplication = check_duplicated_base_id(buffers, base_id);

      // Duplication decision
      if (create_type === 'MTL') {
        if (
          station_duplication.is_duplicated ||
          buffer_duplication.is_duplicated
        ) {
          is_duplicated = true;
        }
      } else if (create_type === 'STATION') {
        if (station_duplication.is_duplicated) {
          if (station_duplication.direction.indexOf(create_direction) >= 0) {
            is_duplicated = true;
          }
        }
        if (buffer_duplication.is_duplicated) {
          if (buffer_duplication.direction.indexOf(create_direction) >= 0) {
            is_duplicated = true;
          }
        }
      } else if (create_type === 'BUFFER') {
        if (station_duplication.is_duplicated) {
          if (station_duplication.direction.indexOf(create_direction) >= 0) {
            is_duplicated = true;
          }
        }
        if (buffer_duplication.is_duplicated) {
          if (buffer_duplication.direction.indexOf(create_direction) >= 0) {
            is_duplicated = true;
          }
        }
      }
    }

    return is_duplicated;
  }

  export function check_duplicated_base_id(layout_objects, base_id) {
    let result: any = {};
    let is_duplicated;
    let direction = '';

    // Check if the point coord is duplicated
    for (let i = 0; i < layout_objects.length; i++) {
      let object = layout_objects[i];

      if (object.pointId === base_id) {
        is_duplicated = true;
        if (object.direction !== undefined) {
          direction += object.direction;
        }
        // break;
      }
    }

    result.is_duplicated = is_duplicated;
    result.direction = direction;

    return result;
  }

  export function create_new_id(existing_objects) {
    let newId = 0;

    for (let i = 0; i < existing_objects.length; i++) {
      if (existing_objects[i].id > newId) {
        newId = existing_objects[i].id;
      }
    }

    return newId + 1;
  }

  export function create_new_segpart_id(segments) {
    let newId = 0;

    for (let i = 0; i < segments.length; i++) {
      let segment = segments[i];

      // Find matched id within segpart
      for (let j = 0; j < segment.segmentParts.length; j++) {
        if (segment.segmentParts[j].id > newId) {
          newId = segment.segmentParts[j].id;
        }
      }
    }
    return newId + 1;
  }

  export function calculate_distance(from, to) {
    let distance;
    let dist_x, dist_y;

    dist_x = from.x - to.x;
    dist_y = from.y - to.y;

    distance = Math.sqrt(dist_x * dist_x + dist_y * dist_y);

    return distance;
  }
  export function reset_connected_candidates(original_segment, segments) {
    let startPoint;
    let endPoint;
    let connected_segments;

    startPoint = original_segment.pointFrom;
    endPoint = original_segment.pointTo;

    // Find connected segments : start point
    connected_segments = find_connected_segment(startPoint, segments);

    for (let i = 0; i < connected_segments.length; i++) {
      let segment = connected_segments[i];

      if (segment.id !== original_segment.id) {
        segment.candidates = [];
      }
    }

    // Find connected segments : end point
    connected_segments = find_connected_segment(endPoint, segments);

    for (let i = 0; i < connected_segments.length; i++) {
      let segment = connected_segments[i];

      if (segment.id !== original_segment.id) {
        segment.candidates = [];
      }
    }
  }
  export function find_segment_within_points(pointIdList, segments) {
    let segmentIdList = [];

    for (let i = 0; i < pointIdList.length - 1; i++) {
      // Set from and to point id
      let from_id = pointIdList[i],
        to_id = pointIdList[i + 1];

      for (let j = 0; j < segments.length; j++) {
        if (
          segments[j].pointFrom.id == from_id &&
          segments[j].pointTo.id == to_id
        ) {
          segmentIdList.push({
            id: segments[j].id,
            path: segments[j].path,
            pointFrom: segments[j].pointFrom,
            pointTo: segments[j].pointTo,
            type: segments[j].type,
          });
          break;
        }
      }
    }

    return segmentIdList;
  }
  export function find_object_by_coord(area_start, area_end, objects) {
    // Find objects
    let found_objects = [];

    if (objects.length > 0) {
      //find selection area's standart coord
      let standard_coord = find_rect_standrad_coord(area_start, area_end);

      // Find points that located inside of selection
      for (let i = 0; i < objects.length; i++) {
        let object = objects[i];

        // Check area
        if (
          object.invertedCoord.x >= standard_coord.start.x &&
          object.invertedCoord.x <= standard_coord.end.x &&
          object.invertedCoord.y >= standard_coord.start.y &&
          object.invertedCoord.y <= standard_coord.end.y
        ) {
          found_objects.push(object);
        }
      }
    }

    return found_objects;
  }

  export function find_rect_standrad_coord(start, end) {
    let coord_start: any = {};
    let coord_end: any = {};

    if (start.x > end.x || start.y > end.y) {
      let minX, minY;
      let maxX, maxY;

      // Swap x coord
      if (start.x > end.x) {
        minX = end.x;
        maxX = start.x;
      } else {
        minX = start.x;
        maxX = end.x;
      }

      // Swap y coord
      if (start.y > end.y) {
        minY = end.y;
        maxY = start.y;
      } else {
        minY = start.y;
        maxY = end.y;
      }

      coord_start.x = minX;
      coord_start.y = minY;

      coord_end.x = maxX;
      coord_end.y = maxY;
    } else {
      coord_start = { ...start };
      coord_end = { ...end };
    }

    return { start: coord_start, end: coord_end };
  }

  export function find_segment_by_coord(area_start, area_end, segments) {
    /****************************************************
     * How to find segment with coordinates
     *
     * Selection area start
     *        (Xs, Ys).-----------------------
     *                |  pointFrom          |
     *   Selection -> |  . (X1, Y1)          |
     *   area         |    \                 |
     *                |      \ Segment       |
     *                |        \             |
     *                |          . (X2, Y2)  |
     *                |            pointTo  |
     *                -----------------------.
     *                    Selection area end (Xe, Ye)
     * Rule : pointFrom must be in the selection area (start~end)
     *        and pointTo must be in the selection area (start~end)
     *****************************************************/
    let found_segments = [];

    if (segments.length > 0) {
      //find selection area's standart coord
      let standard_coord = find_rect_standrad_coord(area_start, area_end);

      for (let i = 0; i < segments.length; i++) {
        let segment = segments[i];
        let point_from_coord = segment.pointFrom.invertedCoord;
        let point_to_coord = segment.pointTo.invertedCoord;

        // Check area
        if (
          point_from_coord.x >= standard_coord.start.x &&
          point_from_coord.x <= standard_coord.end.x &&
          point_from_coord.y >= standard_coord.start.y &&
          point_from_coord.y <= standard_coord.end.y &&
          point_to_coord.x >= standard_coord.start.x &&
          point_to_coord.x <= standard_coord.end.x &&
          point_to_coord.y >= standard_coord.start.y &&
          point_to_coord.y <= standard_coord.end.y
        ) {
          found_segments.push(segment);
        }
      }
    }

    return found_segments;
  }

  export function remove_unconnected_segment(layout_objects) {
    let adjusted_selected_opbjects = [];

    for (let i = 0; i < layout_objects.length; i++) {
      let object = layout_objects[i];

      // Check connection
      if (object.constructor.name.toUpperCase() === 'SEGMENT') {
        let is_start_connected;
        let is_end_connected;

        is_start_connected = layout_objects.find(
          (data) =>
            data.constructor.name.toUpperCase() === 'POINT' &&
            data.id === object.pointFrom.id
        );

        is_end_connected = layout_objects.find(
          (data) =>
            data.constructor.name.toUpperCase() === 'POINT' &&
            data.id === object.pointTo.id
        );

        if (is_start_connected && is_end_connected) {
          adjusted_selected_opbjects.push(object);
        }
      } else {
        adjusted_selected_opbjects.push(object);
      }
    }
    return adjusted_selected_opbjects;
  }
  export function check_duplicated_coord(layout_objects, coord) {
    let is_duplicated = false;

    // Check if the point coord is duplicated
    for (let i = 0; i < layout_objects.length; i++) {
      let object = layout_objects[i];

      if (object.coord.x === coord.x && object.coord.y === coord.y) {
        is_duplicated = true;
        break;
      }
    }

    return is_duplicated;
  }

  export function remove_duplicate(original_array) {
    let refined_array = [];

    for (let i = 0; i < original_array.length; i++) {
      let current_data = original_array[i];

      if (
        refined_array.find((data) => data.id === current_data.id) === undefined
      ) {
        refined_array.push(current_data);
      }
    }

    return refined_array;
  }

  export function get_changes(old_array, new_array, exceptions) {
    let changes = [];
    let old_modified = [];
    let new_modified = [];

    if (old_array && new_array) {
      for (let i = 0; i < old_array.length; i++) {
        let item = {
          ...old_array[i],
        };

        for (let j = 0; j < exceptions.length; j++) {
          delete item[exceptions[j]];
        }

        old_modified.push(item);
      }

      for (let i = 0; i < new_array.length; i++) {
        let item = {
          ...new_array[i],
        };

        for (let j = 0; j < exceptions.length; j++) {
          delete item[exceptions[j]];
        }

        new_modified.push(item);
      }

      new_modified = remove_duplicate(new_modified);
      new_array = remove_duplicate(new_array);

      let match = new_array.map((e) => {
        return [e.id, null];
      });

      // Find DELETE, UPDATE, NONE
      for (let i = 0; i < old_modified.length; i++) {
        let delete_flag = true;
        for (let j = 0; j < new_modified.length; j++) {
          // Found matching id
          if (old_modified[i].id === new_modified[j].id) {
            delete_flag = false;

            // If values are different, "UPDATE"
            if (
              JSON.stringify(old_modified[i]) !==
              JSON.stringify(new_modified[j])
            ) {
              match[j][1] = 'UPDATE';
              changes.push({
                id: old_modified[i].id,
                status: 'UPDATE',
                object: new_array[j],
              });
            } else {
              // Values are same, "NONE"

              match[j][1] = 'NONE';
              changes.push({
                id: old_modified[i].id,
                status: 'NONE',
                object: null,
              });
            }
            break;
          }
        }
        if (delete_flag) {
          changes.push({
            id: old_modified[i].id,
            status: 'DELETE',
            object: null,
          });
        }
      }

      // Find "ADD"
      for (let i = 0; i < match.length; i++) {
        // If operation field empty
        if (match[i][1] === null) {
          // No ops ("operations") value was given, "ADD"
          changes.push({
            id: new_modified[i].id,
            status: 'ADD',
            object: new_array[i],
          });
        }
      }
    }
    return changes;
  }
}
