import { IViewerData } from '../../../models/map.interface';

export class TrackNodeHelper {
  logger = console;
  log_perf = console;

  vehicles: any = {};
  points: any = {};
  stations: any = {};
  buffers: any = {};

  private get_ids = (type) => {
    return new Promise((resolve, reject) => {
      // let t0 = performance.now();
      // @TODO get track ids api 구현
      console.warn('@ get_json_data API 구현 필요 @');
      // Util.network.get_json_data(
      //   `${urls.track_id_list_url}/${type}`,
      //   (error, data) => {
      //     let elapsed = performance.now() - t0;
      //     this.log_perf.log(`load ${type}: ${elapsed}`);
      //     if (error) {
      //       reject(error);
      //     } else {
      //       resolve(data);
      //     }
      //   }
      // );
    });
  };

  load_ids(callback) {
    // logger.log('loading ids');
    this.get_ids('vehicle')
      .then((data) => {
        this.vehicles = this.convert_array_to_object(data, null);
        return this.get_ids('point');
      })
      .then((data) => {
        this.points = this.convert_array_to_object(data, 'p');
        return this.get_ids('station');
      })
      .then((data) => {
        this.stations = this.convert_array_to_object(data, 's');
        return this.get_ids('buffer');
      })
      .then((data) => {
        this.buffers = this.convert_array_to_object(data, 'b');
        callback(null);
      })
      .catch((error) => {
        this.logger.warn(error);
        callback(error);
      });
  }

  load_track_ids(callback) {
    // this.logger.log('loading track ids');
    this.get_ids('point')
      .then((data) => {
        this.points = this.convert_array_to_object(data, 'p');
        return this.get_ids('station');
      })
      .then((data) => {
        this.stations = this.convert_array_to_object(data, 's');
        return this.get_ids('buffer');
      })
      .then((data) => {
        this.buffers = this.convert_array_to_object(data, 'b');
        callback(null);
      })
      .catch((error) => {
        this.logger.warn(error);
        callback(error);
      });
  }

  load_vehicle_ids(callback) {
    // this.logger.log('loading vehicle ids');
    this.get_ids('vehicle')
      .then((data) => {
        this.vehicles = this.convert_array_to_object(data, null);
        callback(null);
      })
      .catch((error) => {
        this.logger.warn(error);
        callback(error);
      });
  }

  update_vehicle_ids(data) {
    if (data && this.vehicles[data.id]) {
      this.vehicles[data.id].logical_id = data.logical_id;
      this.vehicles[data.id].physical_id = data.physical_id;
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
  }

  private convert_array_to_object(array, prefix) {
    // let t0 = performance.now();
    let result: any = {};

    for (let i = 0; i < array.length; i++) {
      result[prefix + array[i].id] = {
        id: prefix + array[i].id,
        logical_id: array[i].logical_id,
        physical_id: array[i].physical_id,
      };
    }

    // let elapsed = performance.now() - t0;
    // this.log_perf.log(`extract ${prefix} : ${elapsed}`);

    return result;
  }

  private find_matched_target_object(object_type) {
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

  get_autocomplete_list(object_type) {
    let result = [];
    let target_objects;
    let ids = [];
    let logical_ids = [];
    let physical_ids = [];

    let matched_objects = this.find_matched_target_object(object_type);
    if (matched_objects) {
      target_objects = Object.values<any>(matched_objects);

      // get the list of id, logical_id and physical id
      for (let i = 0; i < target_objects.length; i++) {
        let id = String(target_objects[i].id);
        let logical_id = target_objects[i].logical_id;
        let physical_id = target_objects[i].physical_id;

        if (id.length > 0) {
          ids.push(id);
        }
        if (logical_id && logical_id.length > 0) {
          logical_ids.push(logical_id);
        }
        if (physical_id && physical_id.length > 0) {
          physical_ids.push(physical_id);
        }
      }

      result = ids.concat(logical_ids, physical_ids);
    }

    return result;
  }

  get_alternative_id(object_type, request_type, id) {
    let result;
    let target_objects = Object.values<any>(this.find_matched_target_object(object_type));

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
          (d) =>
            d.logical_id == alternative_id || d.physical_id == alternative_id
        );

      if (
        !matched_object &&
        (!search_category || search_category.includes('VEHICLE'))
      ) {
        matched_object = Object.values<any>(this.vehicles).find(
          (d) =>
            d.logical_id == alternative_id || d.physical_id == alternative_id
        );
      }
      if (
        !matched_object &&
        (!search_category || search_category.includes('STATION'))
      ) {
        matched_object = Object.values<any>(this.stations).find(
          (d) =>
            d.logical_id == alternative_id || d.physical_id == alternative_id
        );
      }
      if (
        !matched_object &&
        (!search_category || search_category.includes('BUFFER'))
      ) {
        matched_object = Object.values<any>(this.buffers).find(
          (d) =>
            d.logical_id == alternative_id || d.physical_id == alternative_id
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
