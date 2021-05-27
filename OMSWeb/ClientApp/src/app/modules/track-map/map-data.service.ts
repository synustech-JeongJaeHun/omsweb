import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Observable, of, Subject } from 'rxjs';
import { IMapGeometry } from '../../models/drawing.model';
import { Dto } from '../../models/dto/track.model';
import { MapTypes } from '../../models/enums';
import { ILookupUnit, ISegment, IViewerData } from '../../models/map.interface';
import { Segment } from '../../models/segment.model';
import { Vehicle } from '../../models/vehicle.model';
import { ExpectedPath } from '../../models/expected-path.model';
import { LayoutUtil } from '../shared/utils/layout.util';
import { MapParser } from './viewer/map-parser';
import {
  IPlaybackTrackChangeEvent,
  ISnapshotData,
} from '../../models/playback.model';

@Injectable({
  providedIn: 'root',
})
export class MapDataService {
  data: IViewerData = {};
  expectedPaths: ExpectedPath[] = [];
  stale_vehicles = [];
  geometry: IMapGeometry;

  snapshotUpdated$ = new Subject<void>();
  playbackTrackUpdated$ = new Subject<IPlaybackTrackChangeEvent>();
  afterPlaybackTrackUpdated$ = new Subject<void>();
  trackDataUpdated$ = new Subject<Dto.ITrackData>();

  updatedVehicleList: { [id: number]: any };

  private parser: MapParser;
  private vehicleStale = 600;

  constructor() {}

  parseData(data: Dto.ITrackData, geometry: IMapGeometry) {
    this.geometry = geometry;
    this.parser = new MapParser(this.data);
    this.data = this.parser.parse(data, geometry);

    if (data.vehiclePath) {
      this.expectedPaths = this.convertExpectedPath(
        data.vehiclePath,
        this.data.segments
      );
    }

    console.log('### parsed track data >>>', this.data);
  }

  clear() {
    this.data = {};
    this.expectedPaths = [];
    this.stale_vehicles = [];
  }

  getChangedSegments(rows: Dto.ISegment[]): any[] {
    const oldData = this.data.segments;
    const newData = this.parser.parseSegments(
      MapTypes.DB,
      rows,
      this.geometry.invertFactorY
    );
    return LayoutUtil.get_changes(oldData, newData, []);
  }
  getChangedClusters(rows: Dto.ICluster[]): any[] {
    const oldData = this.data.clusters;
    const newData = this.parser.parseClusters(MapTypes.DB, rows);
    return LayoutUtil.get_changes(oldData, newData, []);
  }
  getChangedGroups(rows: Dto.IGroup[]): any[] {
    const oldData = this.data.groups;
    const newData = this.parser.parseGroups(MapTypes.DB, rows);
    return LayoutUtil.get_changes(oldData, newData, []);
  }
  getChangedMtls(rows: Dto.IMTL[]): any[] {
    const oldData = this.data.mtls;
    const newData = this.parser.parseMtls(MapTypes.DB, rows);
    return LayoutUtil.get_changes(oldData, newData, []);
  }
  getChangedBuffers(rows: Dto.IBuffer[]): any[] {
    const oldData = this.data.buffers;
    const newData = this.parser.parseBuffers(MapTypes.DB, rows);
    return LayoutUtil.get_changes(oldData, newData, []);
  }
  getChangedStations(rows: Dto.IStation[]): any[] {
    const oldData = this.data.stations;
    const newData = this.parser.parseStations(MapTypes.DB, rows);
    return LayoutUtil.get_changes(oldData, newData, []);
  }
  getChangedExpectedPaths(rows: any[]) {
    const segments = this.data.segments;
    if (!segments || segments.length === 0) return [];

    const oldData = this.expectedPaths;
    const newData = this.convertExpectedPath(rows, segments);
    return LayoutUtil.get_changes(oldData, newData, []);
  }
  updateExpectedPath(updatedData: any[]) {
    for (let update of updatedData) {
      if (update.status === 'UPDATE') {
        let matched_idx = this.expectedPaths.findIndex((path) => {
          return path.id === update.object.id;
        });

        this.expectedPaths[matched_idx] = update.object;
      } else if (update.status === 'DELETE') {
        let matched_idx = this.expectedPaths.findIndex((path) => {
          return path.id === update.id;
        });

        this.expectedPaths.splice(matched_idx, 1);
      } else if (update.status === 'ADD') {
        this.expectedPaths.push(update.object);
      }
    }
  }

  applySnapshot(data: ISnapshotData, eventVersion: number) {
    if (data.segments) {
      this.setSegmentsRawData(data.segments);
      if (data.segmentDisabled) {
        this.setDisabledSegmentsData(data.segmentDisabled);
        this.applyDisableToSegment();
      }
    }

    this.setVehiclesRawData(data.vehicles, eventVersion);
    this.snapshotUpdated$.next();

    // @TODO
    /**
     *
      TableSet.load_table_data(tables.order_playback, [...timeline.orders])
      TableSet.load_table_data(tables.vehicle_playback, result && result.vehicles ? [...result.vehicles] : [])

      // Map order_deltas to vehicle_deltas
      timeline.event_tables['vehicle_history'] = map_vehicle_deltas_into_vehicle_history_events(get_events('vehicle_history'), get_events('order_history'), timeline.orders)
      timeline.event_tables['order_history'] = map_order_history_delta_to_order_status_format(get_events('order_history'))

     */
  }

  /**
   * update_vehicle_update_list
   * @param vehicle_change
   * @param veh_id
   */
  updateVehicleChangedProps(
    vehicle_change: any,
    veh_id: number
  ) {
    const current_list = this.updatedVehicleList;
    // If there were any changes to reflect. Proceed with this logic
    if (vehicle_change[veh_id]) {
      if (current_list[veh_id]) {
        Object.keys(vehicle_change[veh_id]).forEach((key) => {
          if (!current_list[veh_id][key]) {
            // Check to see if the update props for the current vehicle is in the list
            current_list[veh_id][key] = true;
          }
        });
      } else {
        // Add to list if doesn't exist
        current_list[veh_id] = vehicle_change[veh_id];
      }
    }
  }

  private setSegmentsRawData(rows: Dto.ISegment[]) {
    this.data.segments = this.parser.parseSegments(
      MapTypes.DB,
      rows,
      this.geometry.invertFactorY
    );
  }
  private setVehiclesRawData(rows: Dto.IVehicle[], eventVersion: number) {
    this.data.vehicles = this.convert_vehicle_object(rows, eventVersion);
  }
  private setDisabledSegmentsData(rows: any[]) {
    this.data.segmentsDisabled = this.parser.parseDisabledSegments(rows);
  }

  private applyDisableToSegment() {
    const segments = this.data.segments;
    const disabled_segments = this.data.segmentsDisabled;

    for (let i = 0; i < segments.length; i++) {
      let segment = segments[i];

      if (disabled_segments && disabled_segments.length > 0) {
        let cumulative_disable_state_for_segment = this.find_disables_with_segment_id(
          segment.id
        );

        if (cumulative_disable_state_for_segment) {
          segment.set_disable(cumulative_disable_state_for_segment);

          // let updated_segment = {
          //   status: 'UPDATE',
          //   object: segment,
          // };
        }
      }
    }
  }

  applyDisableSegmentData(
    rows: any[],
    operation: string,
    disabled_segment_id: number
  ): any[] {
    // get target index
    let disable_index = !this.data?.segmentsDisabled
      ? -1
      : this.data.segmentsDisabled.findIndex(
          (d) => d && d.id == disabled_segment_id
        );
    let segment: Segment;
    let updated_segments: number[] = [];

    if (operation === 'DELETE') {
      if (disable_index > -1) {
        let deleted_disabled_segment = this.data.segmentsDisabled.splice(
          disable_index,
          1
        )[0];
        segment = this.data.segments.find(
          (d) => d.id == deleted_disabled_segment.segment_id
        );
      }
    } else {
      // let disabled_segment = convert_disabled_segment(data)[0];
      let disabled_segment = this.parser.parseDisabledSegments(rows)[0];
      if (disabled_segment)
        segment = this.data.segments.find(
          (d) => d.id == disabled_segment.segment_id
        );

      if (operation === 'INSERT') {
        if (disable_index === -1)
          this.data.segmentsDisabled.push(disabled_segment);
      } else if (operation === 'UPDATE') {
        let removed_disabled_segment = this.data.segmentsDisabled.splice(
          disable_index,
          1,
          disabled_segment
        )[0];

        // If the segment_id was changed in the disabled data, remove disabled from the previously diabled segment
        if (
          removed_disabled_segment.segment_id != disabled_segment.segment_id
        ) {
          let segment_to_remove_disabled_from = this.data.segments.find(
            (d) => d.id == removed_disabled_segment.segment_id
          );
          let cumulative_disable_state_for_segment = this.find_disables_with_segment_id(
            segment_to_remove_disabled_from.id
          );
          segment_to_remove_disabled_from.set_disable(
            cumulative_disable_state_for_segment
          );
          updated_segments.push(segment_to_remove_disabled_from.id);
        }
      }
    }

    if (segment) {
      updated_segments.push(segment.id);
      let cumulative_disable_state_for_segment = this.find_disables_with_segment_id(
        segment.id
      );

      // set disable to the new segment
      segment.set_disable(cumulative_disable_state_for_segment);
    }

    return this.data.segmentsDisabled;
  }

  applyVehicleData(
    raw_data: Dto.IVehicle[],
    operation: string,
    vehicleId: number
    // vehicle_stale: number,
    // playback_last_event_time: number
  ): {
    isDomUpdated: boolean;
    updatedVehicles: Vehicle[];
    update: any;
  } {
    let is_dom_update = false;
    let target_index;
    let update: any = {};
    let updated_vehicles = [];

    // get target index
    if (vehicleId && (operation == 'DELETE' || operation == 'UPDATE')) {
      target_index = this.data.vehicles.findIndex((d) => d.id == vehicleId);
    }

    // apply update
    if (operation == 'DELETE') {
      if (target_index > -1) {
        this.data.vehicles.splice(target_index, 1);
        is_dom_update = true;
      }
    } else {
      // convert raw data to object
      updated_vehicles = this.convert_vehicle_object(
        raw_data
        // playback_last_event_time
      );

      if (operation == 'INSERT') {
        if (this.data.vehicles) {
          this.data.vehicles.push(...updated_vehicles);
        } else {
          this.data.vehicles = updated_vehicles;
        }

        is_dom_update = true;
      } else if (operation == 'UPDATE') {
        if (target_index > -1) {
          updated_vehicles = this.set_last_point(
            this.data.vehicles,
            updated_vehicles
          );

          let old_vehicle = this.data.vehicles[target_index];
          let updated_props = {};
          for (let prop in updated_vehicles[0]) {
            if (
              JSON.stringify(old_vehicle[prop]) !=
              JSON.stringify(updated_vehicles[0][prop])
            ) {
              updated_props[prop] = true;
            }
          }

          // Put the update properties in to update object with vehicle id at the key
          update[parseInt(updated_vehicles[0].id)] = updated_props;

          this.data.vehicles[target_index] = updated_vehicles[0];
          is_dom_update = true;
        }
      }
    }

    return {
      isDomUpdated: is_dom_update,
      update,
      updatedVehicles: updated_vehicles,
    };
  }

  private convertExpectedPath(
    vehicle_paths: any[],
    segments: Segment[]
  ): ExpectedPath[] {
    let paths: ExpectedPath[] = [];

    for (let expected_path of vehicle_paths) {
      const { id, path } = expected_path;
      const pointList = path.split(',');
      const pathSegments = LayoutUtil.find_segment_within_points(
        pointList,
        segments
      );
      paths.push(new ExpectedPath(id, pointList, pathSegments));
    }
    return paths;
  }

  private inject_group_data(type: string, objects: any[]): any[] {
    let grouped_objects = [];
    this.data.groups.forEach((group) => {
      grouped_objects.push({
        groupId: group.id,
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
              objects[i].group = group.groupId;
              group.objects.splice(j, 1);
              break; // @NOTE check : 성능을 높이기 위해서 break 했는데, group.objects에 동일한 아이디가 여러개 있는 데이터가 가능하다면 사용하면 안된다.
            }
          }
        }
      }
    }

    return objects;
  }

  find_point_coords(pointId: any) {
    if (pointId == null || pointId == undefined) {
      return null;
    }

    let coord = {};
    let invertedCoord = {};
    let is_match = false;

    for (let i = 0; i < this.data.points.length; i++) {
      let point = this.data.points[i];
      if (point.id === pointId) {
        coord = point.coord;
        invertedCoord = point.invertedCoord;
        is_match = true;
        break;
      }
    }

    if (is_match) {
      return { coord, invertedCoord };
    }
    return null;
  }

  private convert_vehicle_object(
    rows: Dto.IVehicle[],
    eventVersion?: number // playback_last_event_time
  ): Vehicle[] {
    if (!rows) return [];
    if (!Array.isArray(rows)) {
      rows = [rows];
    }

    let converted_vehicles = [];
    rows = this.inject_group_data('vehicle', rows);

    converted_vehicles = rows.reduce((models: Vehicle[], row: Dto.IVehicle) => {
      if (row) {
        try {
          const {
            curPoint: cur_id,
            nextPoint: next_id,
            commandPoint: comm_id,
          } = row;
          let currentPoint: any, nextPoint: any, commandPoint: any;
          const current_coords = this.find_point_coords(cur_id);
          const next_coords = this.find_point_coords(next_id);
          // curPoint
          if (current_coords) {
            currentPoint = {
              point: cur_id,
              coord: current_coords.coord,
              invertedCoord: current_coords.invertedCoord,
            };
          } else {
            currentPoint = null;
          }
          // current_coords &&
          //   (currentPoint = {
          //     point: cur_id,
          //     coord: current_coords.coord,
          //     invertedCoord: current_coords.invertedCoord,
          //   });

          // nextPoint
          if (next_id && next_coords) {
            if (next_coords && current_coords) {
              nextPoint = {
                point: next_id,
                coord: next_coords.coord,
                invertedCoord: next_coords.invertedCoord,
              };
            } else {
              nextPoint = null;
            }
          }
          // next_id &&
          //   next_coords &&
          //   current_coords &&
          //   (nextPoint = {
          //     point: next_id,
          //     coord: next_coords.coord,
          //     invertedCoord: next_coords.invertedCoord,
          //   });

          // commandPoint
          if (!_.isNil(comm_id) && comm_id.length > 0) {
            let object_id: string;
            let base_point_id: number;

            if (comm_id[0].toUpperCase() === 'S') {
              object_id = comm_id.substring(1, comm_id.length);

              // Find target object
              let base_object = this.find_layout_object(
                'STATION',
                parseInt(object_id)
              );
              base_point_id = base_object ? base_object.pointId : null;
            } else if (comm_id[0].toUpperCase() === 'B') {
              object_id = comm_id.substring(1, comm_id.length);

              // Find target object
              let base_object = this.find_layout_object(
                'BUFFER',
                parseInt(object_id)
              );
              base_point_id = base_object ? base_object.pointId : null;
            } else {
              base_point_id = parseInt(comm_id);
            }

            if (base_point_id !== null) {
              const command_coords = this.find_point_coords(base_point_id);

              if (next_coords && current_coords && command_coords) {
                commandPoint = {
                  point: base_point_id,
                  coord: command_coords.coord,
                  invertedCoord: command_coords.invertedCoord,
                };
              } else {
                commandPoint = null;
              }
            }
          }

          const { priority, lastContact } = row;
          const _lastContact = lastContact ? Date.parse(lastContact) : null;
          const hotLot = Number(priority).valueOf() === 99;
          const vehicle = new Vehicle(
            row,
            currentPoint,
            nextPoint,
            commandPoint,
            _lastContact,
            hotLot
          );
          vehicle.check_stale(
            this.vehicleStale,
            row.historyChangeTime
              ? new Date(row.historyChangeTime).getTime()
              : eventVersion
              ? eventVersion
              : null
          );
          this.store_stale_list(vehicle);
          models.push(vehicle);
        } catch (error) {
          console.warn(`convert failed for vehicleId ${row.id}: `, error);
        }
      }
      return models;
    }, []);

    return converted_vehicles;
  }

  find_layout_object(
    object_type: any,
    object_id: any,
    track?: any,
    vehicle_data?: any
  ) {
    let layout_object = null;

    if (!track) {
      track = this.data;
    }
    if (!vehicle_data) {
      vehicle_data = this.data.vehicles;
    }

    if (object_id !== null) {
      let target_objects = this.get_layout_objects(object_type);

      if (target_objects) {
        const target = target_objects.find((o) => o && o.id == object_id);
        target && (layout_object = target);
        // for (let i = 0; i < target_objects.length; i++) {
        //   console.warn('### target_objects >>', target_objects[i]);
        //   if (target_objects[i].id == object_id) {
        //     layout_object = target_objects[i];
        //     break;
        //   }
        // }
      }
    }

    return layout_object;
  }
  get_layout_objects(object_type: any) {
    if (object_type === 'POINT') {
      return this.data.points;
    } else if (object_type === 'SEGMENT') {
      return this.data.segments;
    } else if (object_type === 'DISABLED_SEGMENT') {
      return this.data.segmentsDisabled;
    } else if (object_type === 'STATION') {
      return this.data.stations;
    } else if (object_type === 'BUFFER') {
      return this.data.buffers;
    } else if (object_type === 'MTL') {
      return this.data.mtls;
    } else if (object_type === 'ZCU') {
      return this.data.zcus;
    } else if (object_type === 'CLUSTER') {
      return this.data.clusters;
    } else if (object_type === 'GROUP') {
      return this.data.groups;
    } else if (object_type === 'VEHICLE') {
      return this.data.vehicles;
    } else return [];
  }
  find_disables_with_segment_id(segment_id: number) {
    let cumulative_disable_state_for_segment = null;

    let related_disabled_segments = this.get_layout_objects(
      'DISABLED_SEGMENT'
    ).filter((d) => {
      return d.segment_id == segment_id;
    });

    if (related_disabled_segments.length > 0) {
      cumulative_disable_state_for_segment = {
        id: related_disabled_segments[0].id,
        segment_id: related_disabled_segments[0].segment_id,
        user: [],
        vehicle: [],
        segment: [],
      };

      for (let disabled_segment of related_disabled_segments) {
        if (disabled_segment.user) {
          cumulative_disable_state_for_segment.user.push(disabled_segment.user);
        }
        if (disabled_segment.vehicle) {
          cumulative_disable_state_for_segment.vehicle.push(
            disabled_segment.vehicle
          );
        }
        if (disabled_segment.segment) {
          cumulative_disable_state_for_segment.segment.push(
            disabled_segment.segment
          );
        }
      }
    }

    return cumulative_disable_state_for_segment;
  }

  private store_stale_list(vehicle: any) {
    var stale_added = false;
    let stale_index = this.stale_vehicles.indexOf(vehicle.id);

    // check if the list has to be updated
    if (vehicle.isStale) {
      if (stale_index == -1) {
        // add
        this.stale_vehicles.push(vehicle.id);
        stale_added = true;
      }
    } else {
      if (stale_index != -1) {
        // remove
        this.stale_vehicles.splice(stale_index, 1);
      }
    }

    return stale_added;
  }

  private set_last_point(old_vehicles: any[], new_vehicles: any[]): any[] {
    new_vehicles.forEach((new_target_vehicle) => {
      let old_target_vehicle = old_vehicles.find((vehicle) => {
        return vehicle.id === new_target_vehicle.id;
      });

      if (
        (new_target_vehicle.curPoint &&
          old_target_vehicle.curPoint &&
          new_target_vehicle.curPoint.point !==
            old_target_vehicle.curPoint.point) ||
        old_target_vehicle.curPoint == null ||
        old_target_vehicle.curPoint == undefined
      ) {
        new_target_vehicle.last_point = old_target_vehicle.curPoint;

        // Mark as moved
        new_target_vehicle.isMoved = true;
      } else {
        new_target_vehicle.last_point = old_target_vehicle.last_point;
      }
    });

    return new_vehicles;
  }

  //#region overlaps
  populateOverlapData(pointId: number, overlapType: string): any[] {
    const overlaps = [];
    let layout_objects: any[];

    if (overlapType === 'OVERLAP_MODULE') {
      layout_objects = this.get_layout_objects('POINT');

      // Check for points
      for (let i = 0; i < layout_objects.length; i++) {
        let exist_in_overlap = this.check_exist_overlap_list(
          layout_objects[i],
          overlaps
        );
        if (
          layout_objects[i] &&
          layout_objects[i].id === pointId &&
          !exist_in_overlap
        ) {
          overlaps.push(layout_objects[i]);
        }
      }
    }

    layout_objects = this.get_layout_objects('STATION');

    // Check for station
    for (let i = 0; i < layout_objects.length; i++) {
      let exist_in_overlap = this.check_exist_overlap_list(
        layout_objects[i],
        overlaps
      );
      if (
        layout_objects[i] &&
        layout_objects[i].pointId === pointId &&
        !exist_in_overlap
      ) {
        overlaps.push(layout_objects[i]);
      }
    }

    layout_objects = this.get_layout_objects('BUFFER') || [];

    // Check for buffer
    for (let i = 0; i < layout_objects.length; i++) {
      // Find matches
      let exist_in_overlap = this.check_exist_overlap_list(
        layout_objects[i],
        overlaps
      );
      if (
        layout_objects[i] &&
        layout_objects[i].pointId === pointId &&
        !exist_in_overlap
      ) {
        overlaps.push(layout_objects[i]);
      }
    }

    layout_objects = this.get_layout_objects('MTL') || [];

    // Check for mtl
    for (let i = 0; i < layout_objects.length; i++) {
      // Find matches
      let exist_in_overlap = this.check_exist_overlap_list(
        layout_objects[i],
        overlaps
      );
      if (
        layout_objects[i] &&
        layout_objects[i].pointId === pointId &&
        !exist_in_overlap
      ) {
        overlaps.push(layout_objects[i]);
      }
    }
    return overlaps;
  }
  populateOverlapDataForVehicles(pointId: any, overlap_type: string): any[] {
    const overlaps: any[] = [];
    for (let i = 0; i < this.data.vehicles.length; i++) {
      let exist_in_overlap = this.check_exist_overlap_list(
        this.data.vehicles[i],
        overlaps
      );
      if (
        this.data.vehicles[i].curPoint &&
        this.data.vehicles[i].curPoint.point === pointId &&
        !exist_in_overlap
      ) {
        overlaps.push(this.data.vehicles[i]);
      }
    }

    return overlaps;
  }
  private check_exist_overlap_list(
    target_object: any,
    adding_overlap_list: any[]
  ) {
    let is_exist = false;

    if (!target_object) return is_exist;

    for (let i = 0; i < adding_overlap_list.length; i++) {
      if (
        adding_overlap_list[i] &&
        target_object.constructor === adding_overlap_list[i].constructor &&
        target_object.id === adding_overlap_list[i].id
      ) {
        is_exist = true;

        break;
      }
    }
    return is_exist;
  }

  //#endregion
}
