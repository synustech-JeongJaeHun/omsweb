import * as _ from 'lodash';
import { Dto } from './dto/track.model';

export class Group {
  objectType = 'Group';
  id: number;
  logicalId: string;
  color: string;
  objects: {
    station: number[];
    buffer: number[];
    mtl: number[];
    vehicle: number[];
    point: number[];
    home: number[];
  };

  constructor(row: Dto.IGroup) {
    const { id, color, logicalId, objects = [] } = row;
    this.objects = {
      station: [],
      buffer: [],
      mtl: [],
      vehicle: [],
      point: [],
      home: [],
    };
    objects.forEach((o) => {
      const { id: objectId, type: objectType } = o;
      this.objects[objectType] && this.objects[objectType].push(objectId);
    });
    this.id = id;
    this.color = color;
    this.logicalId = logicalId;
  }

  get_track_objects() {
    if (this.objects.station === undefined) {
      this.objects.station = [];
    }
    if (this.objects.buffer === undefined) {
      this.objects.buffer = [];
    }
    if (this.objects.point === undefined) {
      this.objects.point = [];
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
  get_points() {
    if (this.objects.point === undefined) {
      this.objects.point = [];
    }
    return this.objects.point;
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
    let logicalId = this.logicalId;
    let color = this.color;
    let objects: any = {};
    for (let type in this.objects) {
      objects[type] = [...this.objects[type]];
    }

    let copied_group = new Group({ id, logicalId, color, objects });

    return copied_group;
  }
}
