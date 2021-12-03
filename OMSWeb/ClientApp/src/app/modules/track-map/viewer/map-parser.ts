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
import { LayoutUtil } from '../../shared/utils/layout.util';
import { MTL } from '../../../models/mtl.model';
import { Cluster } from '../../../models/cluster.model';
import { ColorPalette } from '../../shared/utils/color-palette';
import { main_css } from '../../shared/utils/css-loader';
import { Zcu } from '../../../models/zcu.model';

export class MapParser {
  constructor(private layout_data: IViewerData) { }

  parse(data: Dto.ITrackData, geometry: IMapGeometry): IViewerData {
    this.layout_data.groups = this.parseGroups(data.mapType, data.groups);
    this.layout_data.points = this.parsePoints(data.mapType, data.points, geometry.invertFactorY);
    this.layout_data.segments = this.parseSegments(data.mapType, data.segments, geometry.invertFactorY);
    this.layout_data.segmentsDisabled = this.parseDisabledSegments(data.segmentDisabled);
    this.layout_data.stations = this.parseStations(data.mapType, data.stations);
    this.layout_data.buffers = this.parseBuffers(data.mapType, data.buffers);
    this.layout_data.mtls = this.parseMtls(data.mapType, data.mtls);
    this.layout_data.clusters = this.parseClusters(data.mapType, data.clusters);
    this.layout_data.zcus = this.parseZcus(data.mapType, data.zcus, geometry.invertFactorY);

    return this.layout_data;
  }
  parseClusters(mapType: MapTypes, rows: Dto.ICluster[]): Cluster[] {
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
          cluster.pointIdList,
          this.layout_data.segments
        );
        cluster.set_path(segments, main_css.cluster.borderOffset);

        models.push(cluster);
      } catch (error) {
        console.warn(`parsing failed for buffer ${row.id}`);
      }
      return models;
    }, []);
  }
  parseZcus(
    mapType: MapTypes,
    rows: Dto.IZcu[],
    coordAdjustment: number
  ): Zcu[] {
    if (!rows) return [];
    return rows.map((r) => {
      const { x, y } = r;
      const { coord, invertedCoord } = LayoutUtil.create_coordinate(
        { x, y },
        coordAdjustment
      );
      return new Zcu(r, { coord, invertedCoord });
    });
  }
  parseMtls(mapType: MapTypes, rows: Dto.IMTL[]): MTL[] {
    if (!rows) return [];
    rows = this.inject_group_data('mtl', rows);
    return rows.reduce((models, row) => {
      try {
        const point = this.layout_data.points.find((p) => p.id === row.pointId);
        if (!point) throw 'not found mtl coordinates';
        const mtl = new MTL(row, true, 'E', point);
        models.push(mtl);
      } catch (error) {
        console.warn(`parsing failed for buffer ${row.id}`);
      }
      return models;
    }, []);
  }
  parseBuffers(mapType: MapTypes, rows: Dto.IBuffer[]): Buffer[] {
    if (!rows) return [];
    rows = this.inject_group_data('buffer', rows);
    const segments = this.layout_data.segments;
    return rows.reduce((models, row) => {
      try {
        const point = this.layout_data.points.find((p) => p.id === row.pointId);
        if (!point) throw 'not found buffer coordinates';
        const buffer = new Buffer(row, true, 'E', point);
        buffer.set_direction_attr(segments);
        models.push(buffer);
      } catch (error) {
        console.warn(`parsing failed for buffer ${row.id}`, error);
      }
      return models;
    }, []);
  }

  parseStations(mapType: MapTypes, rows: Dto.IStation[]): Station[] {
    if (!rows) return [];
    // Inject groups data into stations data
    rows = this.inject_group_data('station', rows);
    const segments = this.layout_data.segments;
    return rows.reduce((models, row) => {
      try {
        const point = this.layout_data.points.find((p) => p.id === row.pointId);
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
  private inject_group_data(type: string, rows: any[]): any[] {
    let groupMembers = [];
    this.layout_data.groups.forEach((group) => {
      groupMembers.push({
        groupId: group.id,
        childIds: group.objects[type] ? [...group.objects[type]] : [],
      });
    });

    if (rows) {
      for (let i = rows.length - 1; i > -1; i--) {
        let row = rows[i];
        for (let group of groupMembers) {
          for (let j = group.childIds.length - 1; j > -1; j--) {
            if (parseInt(row.id) === parseInt(group.childIds[j])) {
              row.group = group.groupId;
              group.childIds.splice(j, 1);
              break; // @NOTE check : 성능을 높이기 위해서 break 했는데, group.objects에 동일한 아이디가 여러개 있는 데이터가 가능하다면 사용하면 안된다.
              // @NOTE optional : some, find, filter 등을 사용하는 방법도 고려(성능 우선)
            }
          }
        }
      }
    }

    return rows;
  }

  parseGroups(mapType: MapTypes, rows: Dto.IGroup[] = []): Group[] {
    return rows.reduce((models, row) => {
      try {
        const { objects } = row;
        if (mapType === MapTypes.FILE) {
          row.objects = objects.map((o) => JSON.parse(o));
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
    rows = this.inject_group_data('point', rows);
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
  parseSegments(
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
        pointFrom: {
          id: segment.pointFrom.id,
        },
        pointTo: {
          id: segment.pointTo.id,
        },
        segmentParts: segment.segmentParts,
      };
    });

    for (let i = 0; i < segments.length; i++) {
      let segment = segments[i];

      // Calculate candidates and add it
      let candidates = LayoutUtil.find_segment_candidate(
        segment.id,
        segment.pointFrom,
        segment.pointTo,
        simple_segments
      );
      segment.candidates = candidates;

      // Validate segment
      const validation = LayoutUtil.check_segment_validation(
        segment.type,
        segment.location,
        segment.direction,
        segment.candidates,
        segment.segmentParts
      );

      if (validation.is_candidate_validate && validation.is_part_validate) {
        segment.isValidate = true;
      } else {
        segment.isValidate = false;

        // Adjust segpart for faulty part
        if (!validation.is_part_validate) {
          const from = segment.pointFrom.coord;
          const to = segment.pointTo.coord;

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
          segment.segmentParts = [seg_part];

          // calculate path
          segment.set_path();
          segment.validateText = validation.part_validate_msg;
          console.warn(`segment ${segment.id} ${segment.validateText}`, {
            candidates,
            validation,
          });
        } else {
          segment.validateText = validation.candidate_validate_msg;
          // @TODO 로그가 많아서 주석처리함 - 나중에 확인
          // console.warn(`segment ${segment.id} ${segment.validateText}`);
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
        const { id, startPoint, endPoint, isValidate } = groups[0];
        try {
          const segmentRow: Dto.ISegment = {
            ...groups[0],
            type: null,
            location: null,
            direction: null,
            candidates: null,
            isValidate: isValidate,
          };
          const fromPoint = this.layout_data.points.find(
            (p) => p.id === startPoint
          );
          const toPoint = this.layout_data.points.find(
            (p) => p.id === endPoint
          );
          const segment = new Segment(segmentRow, 'E', fromPoint, toPoint);
          this.initializeSegmentCreation(
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
  private initializeSegmentCreation(
    segment: Segment,
    parts: ISegmentPart[],
    adjustment: number
  ) {
    segment.postCreation();
    segment.segmentParts = parts;

    // Calculate main direction
    let direction = LayoutUtil.detect_direction(
      segment.pointFrom.coord,
      segment.pointTo.coord
    );

    // Find segment summary and add
    let segment_summary = LayoutUtil.find_segment_summary(
      direction,
      segment.segmentParts
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
      const { startPoint, endPoint } = row;
      const segmentRow: Dto.ISegment = {
        ...row,
        type: null,
        location: null,
        direction: null,
        candidates: null,
        isValidate: null,
      };
      const fromPoint = this.layout_data.points.find(
        (p) => p.id === startPoint
      );
      const toPoint = this.layout_data.points.find((p) => p.id === endPoint);
      const segment = new Segment(
        segmentRow,
        // parts,
        'E',
        fromPoint,
        toPoint
        // adjustment
      );
      this.initializeSegmentCreation(
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

  parseDisabledSegments(rows: any[]): any[] {
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
          let prefix = rows[i].disabledBy.substring(0, 4);
          let source = rows[i].disabledBy.substring(
            4,
            rows[i].disabledBy.length
          );

          disabled_segment = {
            id: rows[i].id,
            segment_id: rows[i].segmentId,
            vehicle: null,
            segment: null,
            user: null,
          };

          let disable_info: any = {};
          if (prefix === 'vid-') {
            // vehicle
            disable_info.source_id = parseInt(source);
            disable_info.reason = rows[i].disabledReason;

            disabled_segment.vehicle = disable_info;
          } else if (prefix === 'sid-') {
            // segment
            disable_info.source_id = parseInt(source);
            disable_info.reason = rows[i].disabledReason;

            disabled_segment.segment = disable_info;
          } else if (prefix === 'uid-') {
            // user
            disable_info.source_id = source;
            disable_info.reason = rows[i].disabledReason;

            disabled_segment.user = disable_info;
          }

          disabled_segments.push(disabled_segment);
        }
      }
    }

    return disabled_segments;
  }
}
