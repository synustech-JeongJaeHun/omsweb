import { LayoutUtil } from '../modules/shared/utils/layout.util';
import { Dto } from './dto/track.model';

export class Cluster {
  id: number;
  color: string;
  logical_id: string;
  max_vehicles: number;
  point_id_list: string[];
  segment_id_list?: string[];
  path?: any;
  inverted_coord_from?: any;
  inverted_coord_to?: any;
  min_x?: number;
  min_y?: number;
  max_x?: number;
  max_y?: number;

  constructor(row: Dto.ICluster, points: string[]) {
    const { id, color, logical_id, max_vehicles } = row;
    this.id = id;
    this.color = color;
    this.logical_id = logical_id;
    this.max_vehicles = max_vehicles;
    this.point_id_list = points;
  }

  set_path(segments_list, border_offset) {
    // If cluster does not have any point information
    if (
      !Array.isArray(segments_list) ||
      segments_list.length === 0 ||
      segments_list == null ||
      segments_list == undefined
    ) {
      this.path = '';
      this.inverted_coord_from = { x: 0, y: 0 };
      this.inverted_coord_to = { x: 0, y: 0 };
      this.min_x = 0;
      this.max_x = 0;
      this.min_y = 0;
      this.max_y = 0;
      return;
    }

    this.path = '';

    if (segments_list.length > 0) {
      this.segment_id_list = [];
      this.inverted_coord_from = segments_list[0].point_from;
      this.inverted_coord_to = segments_list[segments_list.length - 1].point_to;
      let path = '';
      let path_container = [];
      let path_string = '';
      for (let i = 0; i < segments_list.length; i++) {
        // Add the list of segment ids to the cluster object
        this.segment_id_list.push(segments_list[i].id);

        // Make a combined path string from the segments list
        path += segments_list[i].path + ' ';
        path_string += segments_list[i].path + ' ';
        if (
          i < segments_list.length - 1 &&
          segments_list[i].point_to.id !== segments_list[i + 1].point_from.id
        ) {
          path_container.push(path_string);
          path_string = '';
        }
      }

      this.set_min_max(path, this, border_offset);

      path_container.push(path_string);
      for (let i = 0; i < path_container.length; i++) {
        let path_list = path_container[i].split(' ');
        let seg_parts = [];
        // Find direction

        for (let j = 0; j < path_list.length; j++) {
          let part: any = {};
          if (path_list[j][0] === 'C') {
            let coords = {
              x: parseInt(path_list[j - 2].match(/[0-9.-]/g).join('')),
              y: parseInt(path_list[j - 1].match(/[0-9.-]/g).join('')),
              x1: parseInt(path_list[j].match(/[0-9.-]/g).join('')),
              y1: parseInt(path_list[j + 1].match(/[0-9.-]/g).join('')),
              x2: parseInt(path_list[j + 2].match(/[0-9.-]/g).join('')),
              y2: parseInt(path_list[j + 3].match(/[0-9.-]/g).join('')),
              xf: parseInt(path_list[j + 4].match(/[0-9.-]/g).join('')),
              yf: parseInt(path_list[j + 5].match(/[0-9.-]/g).join('')),
            };
            part.coordinates = coords;
            let start_dir = LayoutUtil.detect_direction(
              { x: coords.x, y: coords.y },
              { x: coords.x1, y: coords.y1 }
            );
            let end_dir = LayoutUtil.detect_direction(
              { x: coords.x2, y: coords.y2 },
              { x: coords.xf, y: coords.yf }
            );
            part.boundary_coord = this.find_curve_boundary_coords(
              start_dir,
              end_dir,
              coords,
              border_offset
            );
            part.type = 'CURVE';
            seg_parts.push(part);
          }
          if (
            (path_list[j][0] === 'M' || path_list[j][0] === 'L') &&
            path_list[j + 2][0] !== 'M' &&
            path_list[j + 2][0] !== 'C'
          ) {
            if (j < path_list.length - 3) {
              part.type = 'D';
              let from = {
                x: parseInt(path_list[j].match(/[0-9.-]/g).join('')),
                y: parseInt(path_list[j + 1].match(/[0-9.-]/g).join('')),
              };
              let to = {
                x: parseInt(path_list[j + 2].match(/[0-9.-]/g).join('')),
                y: parseInt(path_list[j + 3].match(/[0-9.-]/g).join('')),
              };
              if (from.x === to.x && from.y === to.y) {
                continue;
              }
              part.dir = LayoutUtil.detect_direction(from, to);

              // Set boundary coordinates
              if (part.dir === 'R') {
                part.boundary_coord = this.make_boundary_coordinates(
                  from,
                  to,
                  0,
                  1,
                  0,
                  -1,
                  border_offset
                );
              } else if (part.dir === 'L') {
                part.boundary_coord = this.make_boundary_coordinates(
                  from,
                  to,
                  0,
                  -1,
                  0,
                  1,
                  border_offset
                );
              } else if (part.dir === 'T') {
                part.boundary_coord = this.make_boundary_coordinates(
                  from,
                  to,
                  1,
                  0,
                  -1,
                  0,
                  border_offset
                );
              } else if (part.dir === 'B') {
                part.boundary_coord = this.make_boundary_coordinates(
                  from,
                  to,
                  -1,
                  0,
                  1,
                  0,
                  border_offset
                );
              } else if (part.dir === 'TR') {
                part.boundary_coord = this.make_boundary_coordinates(
                  from,
                  to,
                  0.75,
                  0.75,
                  -0.75,
                  -0.75,
                  border_offset
                );
              } else if (part.dir === 'TL') {
                part.boundary_coord = this.make_boundary_coordinates(
                  from,
                  to,
                  0.75,
                  -0.75,
                  -0.75,
                  0.75,
                  border_offset
                );
              } else if (part.dir === 'BL') {
                part.boundary_coord = this.make_boundary_coordinates(
                  from,
                  to,
                  -0.75,
                  -0.75,
                  0.75,
                  0.75,
                  border_offset
                );
              } else if (part.dir === 'BR') {
                part.boundary_coord = this.make_boundary_coordinates(
                  from,
                  to,
                  -0.75,
                  0.75,
                  0.75,
                  -0.75,
                  border_offset
                );
              }
              seg_parts.push(part);
            }
          }
        }

        // Right border
        for (let j = 0; j < seg_parts.length; j++) {
          let part = seg_parts[j];
          let coord = part.boundary_coord.right_side;

          if (j === 0) {
            this.path += `M${coord.x} ${coord.y} `;
          }

          if (part.type === 'CURVE') {
            this.path += `L${coord.x} ${coord.y} C${coord.x1} ${coord.y1} ${coord.x2} ${coord.y2} ${coord.xf} ${coord.yf} `;
          } else {
            this.path += `L${coord.x} ${coord.y} L${coord.xf} ${coord.yf} `;
          }

          if (j === seg_parts.length - 1) {
            let last_coord = part.boundary_coord.left_side;
            // this.path += `L${last_coord.xf} ${last_coord.yf} `

            let bezier_1, center_coord, bezier_2;

            if (part.dir === 'T') {
              (bezier_1 = { x1: 0, y1: -1, x2: 1, y2: 0 }),
                (center_coord = { x: -1, y: -1 });
              bezier_2 = { x1: -1, y1: 0, x2: 0, y2: -1 };
            } else if (part.dir === 'B') {
              (bezier_1 = { x1: 0, y1: 1, x2: -1, y2: 0 }),
                (center_coord = { x: 1, y: 1 });
              bezier_2 = { x1: 1, y1: 0, x2: 0, y2: 1 };
            } else if (part.dir === 'R') {
              (bezier_1 = { x1: 1, y1: 0, x2: 0, y2: 1 }),
                (center_coord = { x: 1, y: -1 });
              bezier_2 = { x1: 0, y1: -1, x2: 1, y2: 0 };
            } else if (part.dir === 'L') {
              (bezier_1 = { x1: -1, y1: 0, x2: 0, y2: -1 }),
                (center_coord = { x: -1, y: 1 });
              bezier_2 = { x1: 0, y1: 1, x2: -1, y2: 0 };
            } else if (part.dir === 'TR') {
              (bezier_1 = { x1: 0.75, y1: -0.75, x2: 0.75, y2: 0.75 }),
                (center_coord = { x: 0, y: -1.5 });
              bezier_2 = { x1: -0.75, y1: -0.75, x2: 0.75, y2: -0.75 };
            } else if (part.dir === 'TL') {
              (bezier_1 = { x1: -0.75, y1: -0.75, x2: 0.75, y2: -0.75 }),
                (center_coord = { x: -1.5, y: 0 });
              bezier_2 = { x1: -0.75, y1: 0.75, x2: -0.75, y2: -0.75 };
            } else if (part.dir === 'BL') {
              (bezier_1 = { x1: -0.75, y1: 0.75, x2: -0.75, y2: -0.75 }),
                (center_coord = { x: 0, y: 1.5 });
              bezier_2 = { x1: 0.75, y1: 0.75, x2: -0.75, y2: 0.75 };
            } else if (part.dir === 'BR') {
              (bezier_1 = { x1: 0.75, y1: 0.75, x2: -0.75, y2: 0.75 }),
                (center_coord = { x: 1.5, y: 0 });
              bezier_2 = { x1: 0.75, y1: -0.75, x2: 0.75, y2: 0.75 };
            }

            let curves = this.get_end_curves(
              coord,
              bezier_1,
              center_coord,
              bezier_2,
              last_coord,
              'FORWARD'
            );

            this.path += curves;
          }
        }

        // Left border
        for (let j = seg_parts.length - 1; j > -1; j--) {
          let part = seg_parts[j];
          let coord = part.boundary_coord.left_side;

          if (part.type === 'CURVE') {
            this.path += `L${coord.xf} ${coord.yf} C${coord.x2} ${coord.y2} ${coord.x1} ${coord.y1} ${coord.x} ${coord.y} `;
          } else {
            this.path += `L${coord.xf} ${coord.yf} L${coord.x} ${coord.y} `;
          }

          if (j === 0) {
            let last_coord = part.boundary_coord.right_side;
            // this.path += `L${last_coord.x} ${last_coord.y} `

            let bezier_1, center_coord, bezier_2;

            if (part.dir === 'T') {
              (bezier_1 = { x1: 0, y1: 1, x2: -1, y2: 0 }),
                (center_coord = { x: 1, y: 1 });
              bezier_2 = { x1: 1, y1: 0, x2: 0, y2: 1 };
            } else if (part.dir === 'B') {
              (bezier_1 = { x1: 0, y1: -1, x2: 1, y2: 0 }),
                (center_coord = { x: -1, y: -1 });
              bezier_2 = { x1: -1, y1: 0, x2: 0, y2: -1 };
            } else if (part.dir === 'R') {
              (bezier_1 = { x1: -1, y1: 0, x2: 0, y2: -1 }),
                (center_coord = { x: -1, y: 1 });
              bezier_2 = { x1: 0, y1: 1, x2: -1, y2: 0 };
            } else if (part.dir === 'L') {
              (bezier_1 = { x1: 1, y1: 0, x2: 0, y2: 1 }),
                (center_coord = { x: 1, y: -1 });
              bezier_2 = { x1: 0, y1: -1, x2: 1, y2: 0 };
            } else if (part.dir === 'TR') {
              (bezier_1 = { x1: -0.75, y1: 0.75, x2: -0.75, y2: -0.75 }),
                (center_coord = { x: 0, y: 1.5 });
              bezier_2 = { x1: 0.75, y1: 0.75, x2: -0.75, y2: 0.75 };
            } else if (part.dir === 'TL') {
              (bezier_1 = { x1: 0.75, y1: 0.75, x2: -0.75, y2: 0.75 }),
                (center_coord = { x: 1.5, y: 0 });
              bezier_2 = { x1: 0.75, y1: -0.75, x2: 0.75, y2: 0.75 };
            } else if (part.dir === 'BL') {
              (bezier_1 = { x1: 0.75, y1: -0.75, x2: 0.75, y2: 0.75 }),
                (center_coord = { x: 0, y: -1.5 });
              bezier_2 = { x1: -0.75, y1: -0.75, x2: 0.75, y2: -0.75 };
            } else if (part.dir === 'BR') {
              (bezier_1 = { x1: -0.75, y1: -0.75, x2: 0.75, y2: -0.75 }),
                (center_coord = { x: -1.5, y: 0 });
              bezier_2 = { x1: -0.75, y1: 0.75, x2: -0.75, y2: -0.75 };
            }

            let curves = this.get_end_curves(
              coord,
              bezier_1,
              center_coord,
              bezier_2,
              last_coord,
              'REVERSE'
            );

            this.path += curves;
          }
        }
      }
      this.path += 'Z';
    }
  }
  copy() {
    let copied_cluster = new Cluster(
      {
        id: this.id,
        logical_id: this.logical_id,
        max_vehicles: this.max_vehicles,
        color: this.color,
      },
      this.point_id_list
    );
    copied_cluster.segment_id_list = this.segment_id_list;
    copied_cluster.min_x = this.min_x;
    copied_cluster.max_x = this.max_x;
    copied_cluster.min_y = this.min_y;
    copied_cluster.max_y = this.max_y;
    copied_cluster.path = this.path;
    copied_cluster.inverted_coord_from = { ...this.inverted_coord_from };
    copied_cluster.inverted_coord_to = { ...this.inverted_coord_to };

    return copied_cluster;
  }

  private curve_offset(
    coords: any,
    rx1: number,
    ry1: number,
    rx2: number,
    ry2: number,
    rsx: number,
    rsy: number,
    rex: number,
    rey: number,
    lx1: number,
    ly1: number,
    lx2: number,
    ly2: number,
    lsx: number,
    lsy: number,
    lex: number,
    ley: number,
    border_offset: number
  ) {
    return {
      right_side: {
        x: coords.x + rsx * border_offset,
        y: coords.y + rsy * border_offset,
        x1: coords.x1 + rx1 * border_offset,
        y1: coords.y1 + ry1 * border_offset,
        x2: coords.x2 + rx2 * border_offset,
        y2: coords.y2 + ry2 * border_offset,
        xf: coords.xf + rex * border_offset,
        yf: coords.yf + rey * border_offset,
      },
      left_side: {
        x: coords.x + lsx * border_offset,
        y: coords.y + lsy * border_offset,
        x1: coords.x1 + lx1 * border_offset,
        y1: coords.y1 + ly1 * border_offset,
        x2: coords.x2 + lx2 * border_offset,
        y2: coords.y2 + ly2 * border_offset,
        xf: coords.xf + lex * border_offset,
        yf: coords.yf + ley * border_offset,
      },
    };
  }

  private find_curve_boundary_coords(
    start_dir: string,
    end_dir: string,
    coords: any,
    border_offset: any
  ) {
    let boundary_coords;
    if (start_dir === 'T' && end_dir === 'R') {
      boundary_coords = this.curve_offset(
        coords,
        1,
        0.5,
        0.5,
        1,
        1,
        0,
        0,
        1,
        -1,
        -0.5,
        -0.5,
        -1,
        -1,
        0,
        0,
        -1,
        border_offset
      );
    } else if (start_dir === 'R' && end_dir === 'B') {
      boundary_coords = this.curve_offset(
        coords,
        -0.5,
        1,
        -1,
        0.5,
        0,
        1,
        -1,
        0,
        0.5,
        -1,
        1,
        -0.5,
        0,
        -1,
        1,
        0,
        border_offset
      );
    } else if (start_dir === 'B' && end_dir === 'L') {
      boundary_coords = this.curve_offset(
        coords,
        -1,
        -0.5,
        -0.5,
        -1,
        -1,
        0,
        0,
        -1,
        1,
        0.5,
        0.5,
        1,
        1,
        0,
        0,
        1,
        border_offset
      );
    } else if (start_dir === 'L' && end_dir === 'T') {
      boundary_coords = this.curve_offset(
        coords,
        0.5,
        -1,
        1,
        -0.5,
        0,
        -1,
        1,
        0,
        -0.5,
        1,
        -1,
        0.5,
        0,
        1,
        -1,
        0,
        border_offset
      );
    } else if (start_dir === 'R' && end_dir === 'T') {
      boundary_coords = this.curve_offset(
        coords,
        0.5,
        1,
        1,
        0.5,
        0,
        1,
        1,
        0,
        -0.5,
        -1,
        -1,
        -0.5,
        0,
        -1,
        -1,
        0,
        border_offset
      );
    } else if (start_dir === 'B' && end_dir === 'R') {
      boundary_coords = this.curve_offset(
        coords,
        -1,
        0.5,
        -0.5,
        1,
        -1,
        0,
        0,
        1,
        1,
        -0.5,
        0.5,
        -1,
        1,
        0,
        0,
        -1,
        border_offset
      );
    } else if (start_dir === 'L' && end_dir === 'B') {
      boundary_coords = this.curve_offset(
        coords,
        -0.5,
        -1,
        -1,
        -0.5,
        0,
        -1,
        -1,
        0,
        0.5,
        1,
        1,
        0.5,
        0,
        1,
        1,
        0,
        border_offset
      );
    } else if (start_dir === 'T' && end_dir === 'L') {
      boundary_coords = this.curve_offset(
        coords,
        1,
        -0.5,
        0.5,
        -1,
        1,
        0,
        0,
        -1,
        -1,
        0.5,
        -0.5,
        1,
        -1,
        0,
        0,
        1,
        border_offset
      );
    }

    return boundary_coords;
  }

  private make_boundary_coordinates(
    from: any,
    to: any,
    rx: number,
    ry: number,
    lx: number,
    ly: number,
    border_offset: number
  ) {
    return {
      right_side: {
        x: from.x + rx * border_offset,
        y: from.y + ry * border_offset,
        xf: to.x + rx * border_offset,
        yf: to.y + ry * border_offset,
      },
      left_side: {
        x: from.x + lx * border_offset,
        y: from.y + ly * border_offset,
        xf: to.x + lx * border_offset,
        yf: to.y + ly * border_offset,
      },
    };
  }

  private set_min_max(
    cluster_path_string: string,
    cluster_object: any,
    border_offset: any
  ) {
    let cluster_path_list = cluster_path_string.split(' ');

    cluster_object.min_x = parseInt(
      cluster_path_list[0].match(/[0-9.-]/g).join('')
    );
    cluster_object.max_x = 0;
    cluster_object.min_y = parseInt(
      cluster_path_list[0].match(/[0-9.-]/g).join('')
    );
    cluster_object.max_y = 0;

    for (let i = 0; i < cluster_path_list.length; i++) {
      // Find edge coordinates of cluster
      if (i < cluster_path_list.length - 1) {
        let x = parseInt(cluster_path_list[i].match(/[0-9.-]/g).join('')),
          y = parseInt(cluster_path_list[i + 1].match(/[0-9.-]/g).join(''));

        // Maximum corners
        if (cluster_object.max_x < x) cluster_object.max_x = x;
        if (cluster_object.max_y < y) cluster_object.max_y = y;

        // Minimum corners
        if (cluster_object.min_x > x) cluster_object.min_x = x;
        if (cluster_object.min_y > y) cluster_object.min_y = y;

        i++;
      }
    }

    cluster_object.min_x -= parseInt(border_offset);
    cluster_object.max_x += parseInt(border_offset);
    cluster_object.min_y -= parseInt(border_offset);
    cluster_object.max_y += parseInt(border_offset);
  }

  private get_end_curves(
    start: any,
    bezier_1: any,
    center: any,
    bezier_2: any,
    end: any,
    direction_type: any
  ) {
    let dist = Math.sqrt(
      Math.pow(end.xf - start.xf, 2) + Math.pow(end.yf - start.yf, 2)
    );
    let mid_length = dist / 2;
    let quarter_length = mid_length / 2;
    let anchor_pt: any = {};
    if (direction_type === 'FORWARD') {
      anchor_pt.x = 'xf';
      anchor_pt.y = 'yf';
    } else if (direction_type === 'REVERSE') {
      anchor_pt.x = 'x';
      anchor_pt.y = 'y';
    }

    let mid_curve_coord = {
        x: start[anchor_pt.x] + center.x * mid_length,
        y: start[anchor_pt.y] + center.y * mid_length,
      },
      first_half_control_pt = {
        x1: start[anchor_pt.x] + bezier_1.x1 * quarter_length,
        y1: start[anchor_pt.y] + bezier_1.y1 * quarter_length,
        x2: mid_curve_coord.x + bezier_1.x2 * quarter_length,
        y2: mid_curve_coord.y + bezier_1.y2 * quarter_length,
      },
      second_half_control_pt = {
        x1: mid_curve_coord.x + bezier_2.x1 * quarter_length,
        y1: mid_curve_coord.y + bezier_2.y1 * quarter_length,
        x2: end[anchor_pt.x] + bezier_2.x2 * quarter_length,
        y2: end[anchor_pt.y] + bezier_2.y2 * quarter_length,
      };

    // First Curve
    let first_curve = `C${first_half_control_pt.x1} ${first_half_control_pt.y1} ${first_half_control_pt.x2} ${first_half_control_pt.y2} ${mid_curve_coord.x} ${mid_curve_coord.y} `;

    // Second Curve
    let second_curve = `C${second_half_control_pt.x1} ${
      second_half_control_pt.y1
    } ${second_half_control_pt.x2} ${second_half_control_pt.y2} ${
      end[anchor_pt.x]
    } ${end[anchor_pt.y]} `;

    return first_curve + second_curve;
  }
}
