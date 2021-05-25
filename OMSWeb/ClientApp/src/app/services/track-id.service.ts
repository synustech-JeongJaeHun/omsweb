import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, forkJoin, Observable, of } from 'rxjs';

import {
  ILookupUnit,
  IViewerData,
  TrackIdMapType,
} from '../models/map.interface';
import { Dto } from '../models/dto/track.model';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TrackIdService {
  private baseUrl = '/api/status';

  private logger = console;
  private log_perf = console;
  vehicles: TrackIdMapType = {};
  points: TrackIdMapType = {};
  stations: TrackIdMapType = {};
  buffers: TrackIdMapType = {};

  constructor(private http: HttpClient) {}

  private queryIds(type: string): Observable<Dto.INodeInfo[]> {
    return this.http.get<Dto.INodeInfo[]>(`${this.baseUrl}/id-list/${type}`);
  }

  loadIds() {
    const jobs = [
      this.queryIds('vehicle'),
      this.queryIds('point'),
      this.queryIds('station'),
      this.queryIds('buffer'),
    ];
    return forkJoin(jobs).pipe(
      tap(([vehicles, points, stations, buffers]) => {
        this.vehicles = this.convert_array_to_object(vehicles, '');
        this.points = this.convert_array_to_object(points, 'p');
        this.stations = this.convert_array_to_object(stations, 's');
        this.buffers = this.convert_array_to_object(buffers, 'b');
      })
    );
  }

  update_vehicle_ids(data) {
    if (data && this.vehicles[data.id]) {
      this.vehicles[data.id].logicalId = data.logicalId;
      this.vehicles[data.id].physicalId = data.physicalId;
    }
  }

  extract_id_from_track(track: IViewerData) {
    if (track.points) {
      this.points = this.convert_array_to_object(track.points, 'p');
    }
    if (track.stations) {
      this.stations = this.convert_array_to_object(track.stations, 's');
    }
    if (track.buffers) {
      this.buffers = this.convert_array_to_object(track.buffers, 'b');
    }
    if (track.vehicles) {
      this.vehicles = this.convert_array_to_object(track.vehicles, '');
    }
  }

  guessLocationId(data: string): string {
    const objectType = this.guessObjectType(data);
    if (!data || !objectType) return '';
    return this.get_alternative_id(objectType, 'logicalId', data) || data;
  }

  lookupUnits(
    scopes: string[],
    id: string,
    exactly = true
  ): Observable<ILookupUnit[]> {
    const result: ILookupUnit[] = [];
    if (!id) return of(result);
    if (scopes.includes('stations')) {
      if (exactly) {
        const item = this.stations['s' + id];
        item && result.push(this.toLookupUnit(item, 'Station'));
      } else {
        const items = Object.values(this.stations).filter((x) =>
          x.id.toString().includes(id)
        );
        items &&
          items.length > 0 &&
          result.push(...items.map((x) => this.toLookupUnit(x, 'Station')));
      }
    }
    if (scopes.includes('points')) {
      if (exactly) {
        const item = this.points['p' + id];
        item && result.push(this.toLookupUnit(item, 'Point'));
      }
    }
    if (scopes.includes('buffers')) {
      if (exactly) {
        const item = this.buffers['b' + id];
        item && result.push(this.toLookupUnit(item, 'Buffer'));
      } else {
        const items = Object.values(this.buffers).filter((x) =>
          x.id.toString().includes(id)
        );
        items &&
          items.length > 0 &&
          result.push(...items.map((x) => this.toLookupUnit(x, 'Buffer')));
      }
    }
    if (scopes.includes('vehicles')) {
      if (exactly) {
        const item = this.vehicles['' + id];
        item && result.push(this.toLookupUnit(item, 'Vehicle'));
      }
    }
    return of(result);
  }

  private toLookupUnit(item: ILookupUnit, objectType: string): ILookupUnit {
    const { id, physicalId, logicalId } = item;
    return { id, objectType, logicalId, physicalId };
  }

  private guessObjectType(combinedId: string): string {
    if (!combinedId) return;
    return this.getObjectTypeByPrefix(combinedId.substr(0, 1)).toLowerCase();
  }

  private getObjectTypeByPrefix(prefix: string): string {
    switch (prefix) {
      case 'b':
        return 'Buffer';
      case 'p':
        return 'Point';
      case 's':
        return 'Station';
      default:
        return 'Vehicle';
    }
  }

  private convert_array_to_object(
    array: ILookupUnit[],
    prefix: string
  ): TrackIdMapType {
    let result: TrackIdMapType = {};

    for (let i = 0; i < array.length; i++) {
      const { id, logicalId, physicalId } = array[i];
      result[prefix + id] = {
        id,
        logicalId,
        physicalId,
      };
    }

    return result;
  }

  find_matched_target_object(object_type): TrackIdMapType {
    let objects;

    object_type = object_type.toLowerCase();

    if (object_type == 'point') {
      objects = this.points;
    } else if (object_type == 'station') {
      objects = this.stations;
    } else if (object_type == 'buffer') {
      objects = this.buffers;
    } else if (object_type == 'vehicle') {
      objects = this.vehicles;
    }

    return objects;
  }

  get_autocomplete_list(object_type: string) {
    let result = [];
    let target_objects;
    let ids = [];
    let logical_ids = [];
    let physical_ids = [];

    let matched_objects = this.find_matched_target_object(object_type);
    if (matched_objects) {
      target_objects = Object.values<any>(matched_objects);

      // get the list of id, logicalId and physical id
      for (let i = 0; i < target_objects.length; i++) {
        let id = String(target_objects[i].id);
        let logicalId = target_objects[i].logicalId;
        let physicalId = target_objects[i].physicalId;

        if (id.length > 0) {
          ids.push(id);
        }
        if (logicalId && logicalId.length > 0) {
          logical_ids.push(logicalId);
        }
        if (physicalId && physicalId.length > 0) {
          physical_ids.push(physicalId);
        }
      }

      result = ids.concat(logical_ids, physical_ids);
    }

    return result;
  }

  get_alternative_id(object_type, request_type, id) {
    let result;
    let target_objects = Object.values<any>(
      this.find_matched_target_object(object_type)
    );

    result = target_objects.find((d) => d.id == id);

    if (result) {
      result = result[request_type];
    } else {
      result = null;
    }

    return result;
  }

  reverse_lookup_id(alternative_id, search_category) {
    let original_id;

    if (alternative_id && alternative_id.length > 0) {
      let matched_object;

      //find matched object
      if (!search_category || search_category.includes('POINT'))
        matched_object = Object.values<any>(this.points).find(
          (d) => d.logicalId == alternative_id || d.physicalId == alternative_id
        );

      if (
        !matched_object &&
        (!search_category || search_category.includes('VEHICLE'))
      ) {
        matched_object = Object.values<any>(this.vehicles).find(
          (d) => d.logicalId == alternative_id || d.physicalId == alternative_id
        );
      }
      if (
        !matched_object &&
        (!search_category || search_category.includes('STATION'))
      ) {
        matched_object = Object.values<any>(this.stations).find(
          (d) => d.logicalId == alternative_id || d.physicalId == alternative_id
        );
      }
      if (
        !matched_object &&
        (!search_category || search_category.includes('BUFFER'))
      ) {
        matched_object = Object.values<any>(this.buffers).find(
          (d) => d.logicalId == alternative_id || d.physicalId == alternative_id
        );
      }

      if (matched_object) {
        original_id = matched_object.id;

        this.logger.log(
          `original id lookup value : ${alternative_id}->${original_id}`
        );
      } else {
        original_id = alternative_id;
      }
    } else {
      original_id = alternative_id;
    }

    return original_id;
  }
}
