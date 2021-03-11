import { ISegmentPart, IViewerData } from '@oms/models/map.interface';
import * as _ from 'lodash';
import { ICoordinate, IMapGeometry } from '../../../models/drawing.model';
import { Dto } from '../../../models/dto/track.model';
import { MapTypes } from '../../../models/enums';
import { Group } from '../../../models/group.model';
import { Point } from '../../../models/point.model';
import { Segment } from '../../../models/segment.model';
import { Station } from '../../../models/station.model';
import { Buffer } from '../../../models/buffer.model';
import { LayoutUtil } from '../utils/layout.util';
import { MTL } from '../../../models/mtl.model';
import { Cluster } from '../../../models/cluster.model';
import { ColorPalette } from '../utils/color-palette';
import { main_css } from '../utils/css-loader';

export class MapParser {
  constructor(private layout_data: IViewerData) {}

  parse(data: Dto.ITrackData, geometry: IMapGeometry): IViewerData {
    this.layout_data.groups = this.parseGroups(data.map_type, data.groups);
    this.layout_data.points = this.parsePoints(
      data.map_type,
      data.points,
      geometry.invert_factor_y
    );
    this.layout_data.segments = this.parseSegments(
      data.map_type,
      data.segments,
      geometry.invert_factor_y
    );
    this.layout_data.segments_disabled = this.parseDisabledSegments(
      data.segment_disabled
    );
    this.layout_data.stations = this.parseStations(
      data.map_type,
      data.stations
    );
    this.layout_data.buffers = this.parseBuffers(data.map_type, data.buffers);
    this.layout_data.mtls = this.parseMtls(data.map_type, data.mtls);
    this.layout_data.clusters = this.parseClusters(
      data.map_type,
      data.clusters
    );

    return this.layout_data;
  }
  private parseClusters(map_type: MapTypes, rows: Dto.ICluster[]): Cluster[] {
    if (!rows) return [];
    return rows.reduce((models, row) => {
      try {
        const { points, color } = row;
        const pointIds = Array.isArray(points)
          ? points
          : points.split(',').map((x) => x.trim());
        row.color =
          !color || !ColorPalette.validate_color(color)
            ? ColorPalette.get_next_available_color(rows)
            : color;
        const cluster = new Cluster(row, pointIds);

        const segments = LayoutUtil.find_all_contigous_segments_from_points(
          cluster.point_id_list,
          this.layout_data.segments
        );
        cluster.set_path(segments, main_css.cluster.border_offset);

        models.push(cluster);
      } catch (error) {
        console.warn(`parsing failed for buffer ${row.id}`);
      }
      return models;
    }, []);
  }
  private parseMtls(map_type: MapTypes, rows: Dto.IMTL[]): MTL[] {
    if (!rows) return [];
    rows = this.inject_group_data('mtl', rows);
    return rows.reduce((models, row) => {
      try {
        const point = this.layout_data.points.find((p) => p.id === row.id);
        if (!point) throw 'not found mtl coordinates';
        const mtl = new MTL(row, true, 'E', point);
        models.push(mtl);
      } catch (error) {
        console.warn(`parsing failed for buffer ${row.id}`);
      }
      return models;
    }, []);
  }
  private parseBuffers(map_type: MapTypes, rows: Dto.IBuffer[]): Buffer[] {
    if (!rows) return [];
    rows = this.inject_group_data('buffer', rows);
    const segments = this.layout_data.segments;
    return rows.reduce((models, row) => {
      try {
        const point = this.layout_data.points.find((p) => p.id === row.id);
        if (!point) throw 'not found buffer coordinates';
        const buffer = new Buffer(row, true, 'E', point);
        buffer.set_direction_attr(segments);
        models.push(buffer);
      } catch (error) {
        // console.warn(`parsing failed for buffer ${row.id}`);
      }
      return models;
    }, []);
  }

  private parseStations(map_type: MapTypes, rows: Dto.IStation[]): Station[] {
    if (!rows) return [];
    // Inject groups data into stations data
    rows = this.inject_group_data('station', rows);
    const segments = this.layout_data.segments;
    return rows.reduce((models, row) => {
      try {
        const point = this.layout_data.points.find((p) => p.id === row.id);
        if (!point) throw 'not found station coordinates';
        const station = new Station(row, true, 'E', point);
        station.set_direction_attr(segments);
        models.push(station);
      } catch (error) {
        // console.warn(`parsing failed for station ${row.id} >>`, error);
      }
      return models;
    }, []);
  }
  private inject_group_data(type: string, objects: any[]): any[] {
    let grouped_objects = [];
    this.layout_data.groups.forEach((group) => {
      grouped_objects.push({
        group_id: group.id,
        objects: group.objects[type] ? [...group.objects[type]] : [],
      });
      return;
    });

    if (objects) {
      for (let i = objects.length - 1; i > -1; i--) {
        let object = objects[i];
        for (let group of grouped_objects) {
          for (let j = group.objects.length - 1; j > -1; j--) {
            if (parseInt(object.id) === parseInt(group.objects[j])) {
              objects[i].group = group.group_id;
              group.objects.splice(j, 1);
              break; // @NOTE check : 성능을 높이기 위해서 break 했는데, group.objects에 동일한 아이디가 여러개 있는 데이터가 가능하다면 사용하면 안된다.
              // @NOTE optional : some, find, filter 등을 사용하는 방법도 고려(성능 우선)
            }
          }
        }
      }
    }

    return objects;
  }

  private parseGroups(mapType: MapTypes, rows: Dto.IGroup[] = []): Group[] {
    return rows.reduce((models, row) => {
      try {
        const { objects } = row;
        if (mapType === MapTypes.FILE) {
          row.objects = objects.map((o: string) => JSON.parse(o));
        }
        models.push(new Group(row));
      } catch (error) {
        console.warn(`convert failed for group ${row.id}: `, error);
      }
      return models;
    }, []);
  }
  private parsePoints(
    mapType: MapTypes,
    rows: Dto.IPoint[] = [],
    coordAdjustment: number
  ): Point[] {
    return rows.reduce((models, p) => {
      try {
        const { x, y, id } = p;
        const coord = LayoutUtil.create_coordinate({ x, y }, coordAdjustment);
        // coord.hasError &&
        //   console.warn(`point coordinates error - id:${id}(${x}, ${y})`);

        models.push(new Point(p, coord, true, 'E'));
      } catch (error) {
        console.warn(`convert failed for point ${p.id}: `, error);
      }
      return models;
    }, []);
  }
  private parseSegments(
    mapType: MapTypes,
    rows: Dto.ISegment[] = [],
    adjustment: number
  ): Segment[] {
    const segments =
      mapType === MapTypes.FILE
        ? this.parseSegmentsFromFile(rows, adjustment)
        : this.parseSegmentsFromDB(mapType, rows, adjustment);

    // Validation part
    // Reduce segment set
    let simple_segments = [];
    simple_segments = segments.map((segment) => {
      return {
        id: segment.id,
        point_from: {
          id: segment.point_from.id,
        },
        point_to: {
          id: segment.point_to.id,
        },
        segment_parts: segment.segment_parts,
      };
    });

    for (let i = 0; i < segments.length; i++) {
      let segment = segments[i];

      // Calculate candidates and add it
      let candidates = LayoutUtil.find_segment_candidate(
        segment.id,
        segment.point_from,
        segment.point_to,
        simple_segments
      );
      segment.candidates = candidates;

      // Validate segment
      const validation = LayoutUtil.check_segment_validation(
        segment.type,
        segment.location,
        segment.direction,
        segment.candidates,
        segment.segment_parts
      );

      if (validation.is_candidate_validate && validation.is_part_validate) {
        segment.is_validate = true;
      } else {
        segment.is_validate = false;

        // Adjust segpart for faulty part
        if (!validation.is_part_validate) {
          const from = segment.point_from.coord;
          const to = segment.point_to.coord;

          const seg_part = Segment.createSegmentPart(
            {
              type: 'D',
              location: null,
              direction: null,
              x1: from.x,
              y1: from.y,
              x2: to.x,
              y2: to.y,
            },
            adjustment
          );
          segment.segment_parts = [seg_part];

          // calculate path
          segment.set_path();
          segment.validate_text = validation.part_validate_msg;
          console.warn(`segment ${segment.id} ${segment.validate_text}`, {
            candidates,
            validation,
          });
        } else {
          segment.validate_text = validation.candidate_validate_msg;
          // @TODO 로그가 많아서 주석처리함 - 나중에 확인
          // console.warn(`segment ${segment.id} ${segment.validate_text}`);
        }
      }
    }
    return segments;
  }
  private parseSegmentsFromDB(
    mapType: MapTypes,
    rows: Dto.ISegment[] = [],
    adjustment: number
  ): Segment[] {
    const segments = _.chain(rows)
      .groupBy('id')
      .map((groups) => {
        const {
          id,
          start_point,
          end_point,
          is_validate,
        } = groups[0];
        try {
          const segmentRow: Dto.ISegment = {
            ...groups[0],
            type: null,
            location: null,
            direction: null,
            candidates: null,
            is_validate: is_validate,
          };
          const fromPoint = this.layout_data.points.find(
            (p) => p.id === start_point
          );
          const toPoint = this.layout_data.points.find(
            (p) => p.id === end_point
          );
          const segment = new Segment(segmentRow, 'E', fromPoint, toPoint);
          this.postSegmentCreation(
            segment,
            this.parseSegmentPartsFromDB(groups, adjustment),
            adjustment
          );

          return segment;
        } catch (error) {
          console.warn(`segment convert error ${id} :`, error);
        }
      })
      .filter((x) => !!x)
      .value();

    return segments;
  }
  private postSegmentCreation(
    segment: Segment,
    parts: ISegmentPart[],
    adjustment: number
  ) {
    const { candidates, speed } = segment;
    segment.set_candidates(candidates);
    segment.set_length(segment.calculate_length());
    segment.set_speed(speed);
    segment.set_travel_time();
    segment.segment_parts = parts;

    // Calculate main direction
    let direction = LayoutUtil.detect_direction(
      segment.point_from.coord,
      segment.point_to.coord
    );

    // Find segment summary and add
    let segment_summary = LayoutUtil.find_segment_summary(
      direction,
      segment.segment_parts
    );
    if (segment_summary !== null) {
      segment.add_summary(segment_summary);
    } else {
      console.warn('null summary for segment ' + segment.id);
    }

    // create segpart with coord
    segment.create_segparts(adjustment);

    // calculate path
    segment.set_path();
  }
  private parseSegmentsFromFile(
    rows: Dto.ISegment[],
    adjustment: number
  ): Segment[] {
    return rows.map((row) => {
      const { start_point, end_point } = row;
      const segmentRow: Dto.ISegment = {
        ...row,
        type: null,
        location: null,
        direction: null,
        candidates: null,
        is_validate: null,
      };
      const fromPoint = this.layout_data.points.find(
        (p) => p.id === start_point
      );
      const toPoint = this.layout_data.points.find((p) => p.id === end_point);
      const segment = new Segment(
        segmentRow,
        // parts,
        'E',
        fromPoint,
        toPoint
        // adjustment
      );
      this.postSegmentCreation(
        segment,
        row.segparts.map((p) => Segment.createSegmentPart(p, adjustment)),
        adjustment
      );

      return segment;
    });
  }
  private parseSegmentPartsFromDB(
    rows: Dto.ISegment[] | Dto.ISegPart[],
    adjustment: number
  ): ISegmentPart[] {
    return (rows as Dto.ISegment[]).map((row: Dto.ISegPart, index: number) => {
      let { x1, y1, x2, y2 } = row;
      if (index === 0) {
        x1 = x2 = y1 = y2 = null;
      }
      return Segment.createSegmentPart(
        {
          ...row,
          x1,
          y1,
          x2,
          y2,
        },
        adjustment
      );
    });
  }

  private parseDisabledSegments(rows: any[]): any[] {
    let disabled_segments = [];

    // Apply disabled state
    if (rows) {
      if (!Array.isArray(rows)) {
        rows = [rows];
      }

      // separate disable info by segment
      for (let i = 0; i < rows.length; i++) {
        // Find redundancy

        let disabled_segment = disabled_segments.find(
          (disabled_segment) => disabled_segment.id === rows[i].id
        );

        // save disable info to the list
        if (!disabled_segment) {
          // Get disable info
          let prefix = rows[i].disabled_by.substring(0, 4);
          let source = rows[i].disabled_by.substring(
            4,
            rows[i].disabled_by.length
          );

          disabled_segment = {
            id: rows[i].id,
            segment_id: rows[i].segment_id,
            vehicle: null,
            segment: null,
            user: null,
          };

          let disable_info: any = {};
          if (prefix === 'vid-') {
            // vehicle
            disable_info.source_id = parseInt(source);
            disable_info.reason = rows[i].disabled_reason;

            disabled_segment.vehicle = disable_info;
          } else if (prefix === 'sid-') {
            // segment
            disable_info.source_id = parseInt(source);
            disable_info.reason = rows[i].disabled_reason;

            disabled_segment.segment = disable_info;
          } else if (prefix === 'uid-') {
            // user
            disable_info.source_id = source;
            disable_info.reason = rows[i].disabled_reason;

            disabled_segment.user = disable_info;
          }

          disabled_segments.push(disabled_segment);
        }
      }
    }

    return disabled_segments;
  }
}
