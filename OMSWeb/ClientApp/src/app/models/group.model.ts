import * as _ from 'lodash';
import { Dto } from './dto/track.model';

export class Group {
  id: number;
  logical_id: string;
  color: string;
  objects: {
    station: number[];
    buffer: number[];
    mtl: number[];
    vehicle: number[];
  };

  constructor(row: Dto.IGroup) {
    const { id, color, logical_id, objects = [] } = row;
    this.objects = {
      station: [],
      buffer: [],
      mtl: [],
      vehicle: [],
    };
    objects.forEach((o) => {
      const { id: objectId, type: objectType } = o;
      const propName = this.getPropName(objectType);
      this.objects[propName].push(objectId);
    });
    this.id = id;
    this.color = color;
    this.logical_id = logical_id;
  }

  private getPropName(rawName: string): string {
    switch (rawName) {
      case 'stations':
        return 'station';
      case 'buffers':
        return 'buffer';
      case 'mtls':
        return 'mtl';
      case 'vehicles':
        return 'vehicle';
      default:
        break;
    }
  }

  get_track_objects() {
    if (this.objects.station === undefined) {
      this.objects.station = [];
    }
    if (this.objects.buffer === undefined) {
      this.objects.buffer = [];
    }
    if (this.objects.mtl === undefined) {
      this.objects.mtl = [];
    }
    return this.objects.buffer.concat(
      this.objects.station.concat(this.objects.mtl)
    );
  }
  get_stations() {
    if (this.objects.station === undefined) {
      this.objects.station = [];
    }
    return this.objects.station;
  }
  get_buffers() {
    if (this.objects.buffer === undefined) {
      this.objects.buffer = [];
    }
    return this.objects.buffer;
  }
  get_mtls() {
    if (this.objects.mtl === undefined) {
      this.objects.mtl = [];
    }
    return this.objects.mtl;
  }
  get_vehicles() {
    if (this.objects.vehicle === undefined) {
      this.objects.vehicle = [];
    }
    return this.objects.vehicle;
  }
  messagefy() {
    let message_arr = [];
    for (let type in this.objects) {
      for (let id of this.objects[type]) {
        message_arr.push(`"${type.charAt(0)}id-${id}"`);
      }
    }
    return message_arr;
  }

  copy() {
    let id = this.id;
    let logical_id = this.logical_id;
    let color = this.color;
    let objects: any = {};
    for (let type in this.objects) {
      objects[type] = [...this.objects[type]];
    }

    let copied_group = new Group({ id, logical_id, color, objects });

    return copied_group;
  }
}
